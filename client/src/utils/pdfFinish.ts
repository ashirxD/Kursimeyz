import type jsPDF from 'jspdf';
import {
    FINISH_PARTS,
    finishPartLabel,
    isFinishPartEmpty,
    isSwatchEmpty,
    resolveFinish,
    type FinishSource,
    type Swatch,
} from '@/utils/productFinish';

/**
 * The finish as it is drawn into the order receipt's PDF — a swatch and the
 * words beside it, one line per part.
 *
 * The on-screen equivalent is ProductFinishSummary; this exists separately
 * because jsPDF has no layout engine. Everything here is positioned by hand in
 * the document's units (mm), so the caller reserves the height it is told to and
 * the drawing lands inside it.
 */

/** One line of the Finish column. */
export interface FinishRow {
    label: string;
    /** The material name, or failing that the hex. May be empty. */
    text: string;
    swatch: Swatch;
}

/** Height of one finish line. */
const ROW_HEIGHT = 5;
const SWATCH_SIZE = 3.6;
const SWATCH_RADIUS = 0.7;
/** Space between the swatch and the label that follows it. */
const SWATCH_GAP = 1.8;
const LABEL_GAP = 1.2;

/** Wide enough for 'Fabric: ' plus a long-ish material name at 8pt. */
export const FINISH_COLUMN_WIDTH = 46;

/** The parts worth drawing for an item, in display order. Legacy rows give []. */
export function finishRows(item: FinishSource | null | undefined): FinishRow[] {
    const finish = resolveFinish(item);

    return FINISH_PARTS.filter(({ key }) => !isFinishPartEmpty(finish[key])).map(
        ({ key, label }) => ({
            label,
            text: finishPartLabel(finish[key]),
            swatch: finish[key].color,
        })
    );
}

/** The height these rows need, before the cell's own padding. */
export const finishRowsHeight = (rows: FinishRow[]) => rows.length * ROW_HEIGHT;

/** Every swatch photo across a set of rows, deduped and ready to fetch. */
export const swatchImageUrls = (rows: FinishRow[][]): string[] =>
    rows.flat().map((row) => row.swatch.image).filter(Boolean);

/**
 * Fetches each swatch photo as a data URL, the only form jsPDF can embed.
 *
 * Anything that will not load — a swatch since deleted from storage, a bucket
 * that refuses cross-origin reads — is left out of the map rather than thrown,
 * and the drawing falls back to the flat average colour that is stored alongside
 * every cropped swatch for exactly this reason.
 */
export async function loadSwatchImages(urls: string[]): Promise<Map<string, string>> {
    const unique = [...new Set(urls.filter(Boolean))];

    const entries = await Promise.all(
        unique.map(async (url): Promise<readonly [string, string] | null> => {
            const controller = new AbortController();
            // A receipt that prints with flat colours beats one that never prints.
            const timer = setTimeout(() => controller.abort(), 5000);

            try {
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) return null;

                const blob = await response.blob();
                if (!blob.type.startsWith('image/')) return null;

                const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result));
                    reader.onerror = () => reject(reader.error);
                    reader.readAsDataURL(blob);
                });

                return [url, dataUrl] as const;
            } catch {
                return null;
            } finally {
                clearTimeout(timer);
            }
        })
    );

    return new Map(
        entries.filter((entry): entry is readonly [string, string] => entry !== null)
    );
}

const hexToRgb = (hex: string): [number, number, number] | null => {
    const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
    if (!match) return null;

    const value = parseInt(match[1], 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

/** 'data:image/png;base64,...' -> 'PNG', which is what addImage wants. */
const imageFormat = (dataUrl: string): string => {
    const match = /^data:image\/([a-z0-9.+-]+)/i.exec(dataUrl);
    return (match ? match[1] : 'png').toUpperCase();
};

/** Trims text to what fits, with an ellipsis, so nothing spills the column. */
const fitText = (doc: jsPDF, text: string, maxWidth: number): string => {
    if (maxWidth <= 0) return '';
    if (doc.getTextWidth(text) <= maxWidth) return text;

    let clipped = text;
    while (clipped.length > 1 && doc.getTextWidth(`${clipped}...`) > maxWidth) {
        clipped = clipped.slice(0, -1);
    }

    return `${clipped}...`;
};

interface DrawArea {
    /** Left edge of the drawing area — the cell's content box, not the cell. */
    x: number;
    /** Top edge of the content box. */
    y: number;
    width: number;
    fontSize: number;
}

/**
 * Draws the finish lines into an area the caller has already reserved.
 *
 * The swatch column is reserved on every line whether or not that line has a
 * colour, so 'Body' and 'Fabric' stay aligned under one another when only one of
 * them is a colour the admin picked.
 */
export function drawFinishRows(
    doc: jsPDF,
    rows: FinishRow[],
    images: Map<string, string>,
    area: DrawArea
): void {
    if (rows.length === 0) return;

    doc.setFontSize(area.fontSize);
    doc.setFont('helvetica', 'normal');

    rows.forEach((row, index) => {
        const middle = area.y + index * ROW_HEIGHT + ROW_HEIGHT / 2;

        if (!isSwatchEmpty(row.swatch)) {
            const top = middle - SWATCH_SIZE / 2;
            const photo = row.swatch.image ? images.get(row.swatch.image) : undefined;

            const drawFlat = () => {
                const rgb = hexToRgb(row.swatch.hex);
                if (!rgb) return;

                doc.setFillColor(rgb[0], rgb[1], rgb[2]);
                doc.roundedRect(
                    area.x,
                    top,
                    SWATCH_SIZE,
                    SWATCH_SIZE,
                    SWATCH_RADIUS,
                    SWATCH_RADIUS,
                    'F'
                );
            };

            if (photo) {
                try {
                    doc.addImage(photo, imageFormat(photo), area.x, top, SWATCH_SIZE, SWATCH_SIZE);
                } catch {
                    // addImage throws on anything it cannot decode — an interlaced
                    // PNG, a format this build was compiled without. One swatch is
                    // not worth losing the receipt over, so fall back to the flat
                    // colour the same way an image that never loaded does.
                    drawFlat();
                }
            } else {
                drawFlat();
            }

            // Outlined whatever was drawn inside, so a white or very pale swatch
            // still reads as a swatch rather than as a gap.
            doc.setDrawColor(170, 170, 170);
            doc.setLineWidth(0.15);
            doc.roundedRect(
                area.x,
                top,
                SWATCH_SIZE,
                SWATCH_SIZE,
                SWATCH_RADIUS,
                SWATCH_RADIUS,
                'S'
            );
        }

        let cursor = area.x + SWATCH_SIZE + SWATCH_GAP;

        const label = row.text ? `${row.label}:` : row.label;
        doc.setTextColor(130, 130, 130);
        doc.text(label, cursor, middle, { baseline: 'middle' });
        cursor += doc.getTextWidth(label) + LABEL_GAP;

        if (row.text) {
            doc.setTextColor(40, 40, 40);
            doc.text(
                fitText(doc, row.text, area.x + area.width - cursor),
                cursor,
                middle,
                { baseline: 'middle' }
            );
        }
    });

    // autoTable draws the rest of the table after this hook returns, so the
    // colours it set are put back rather than left as ours.
    doc.setTextColor(0, 0, 0);
}
