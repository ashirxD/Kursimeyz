// How a product photo is framed on a shop card. The upload itself is never
// touched: these numbers are saved beside it and applied when it is drawn, so
// the admin can re-adjust a photo at any time and the admin card and the shop
// card render the same crop from the same data.
//
// Mirrors client/src/utils/productImageDisplay.ts.

// Card shapes an admin can give a collection. `width:height`.
const CARD_ASPECTS = ['4:3', '1:1', '4:5', '3:4', '3:2', '16:9'];
const DEFAULT_CARD_ASPECT = '4:3';

const FITS = ['cover', 'contain'];
const MAX_ZOOM = 3;
const MAX_PADDING = 20;

const DEFAULTS = {
  fit: 'contain',
  zoom: 1,
  x: 50,
  y: 50,
  padding: 7,
  background: '',
};

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

const clamp = (value, min, max, fallback) => {
  const number = Number(value);
  if (value === null || value === '' || !Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
};

const round = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const normalizeCardAspect = (value) =>
  CARD_ASPECTS.includes(value) ? value : DEFAULT_CARD_ASPECT;

// Cleans whatever the client sent into one entry per gallery photo, keyed by URL
// so reordering or removing photos can never attach a crop to the wrong one.
// Returns undefined when the client sent no list at all, which callers treat as
// "leave what is stored alone" rather than "clear it".
const normalizeImageDisplay = (list, gallery) => {
  if (!Array.isArray(list)) return undefined;

  const allowed = new Set(gallery);
  const seen = new Set();
  const cleaned = [];

  list.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;

    const url = typeof entry.url === 'string' ? entry.url.trim() : '';
    if (!url || !allowed.has(url) || seen.has(url)) return;
    seen.add(url);

    const background =
      typeof entry.background === 'string' ? entry.background.trim().toLowerCase() : '';

    cleaned.push({
      url,
      fit: FITS.includes(entry.fit) ? entry.fit : DEFAULTS.fit,
      zoom: round(clamp(entry.zoom, 1, MAX_ZOOM, DEFAULTS.zoom), 2),
      x: round(clamp(entry.x, 0, 100, DEFAULTS.x), 1),
      y: round(clamp(entry.y, 0, 100, DEFAULTS.y), 1),
      padding: round(clamp(entry.padding, 0, MAX_PADDING, DEFAULTS.padding), 1),
      background: HEX_COLOR.test(background) ? background : DEFAULTS.background,
    });
  });

  return cleaned;
};

module.exports = {
  CARD_ASPECTS,
  DEFAULT_CARD_ASPECT,
  MAX_ZOOM,
  MAX_PADDING,
  normalizeCardAspect,
  normalizeImageDisplay,
};
