import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { HeroBadgePosition, HomeHeroContent } from '@/hooks/useHomePage';
import { resolveImageUrl } from '@/utils/imageUrl';
import { mix, withAlpha } from '@/utils/themeColor';

interface HomeHeroProps {
    hero: HomeHeroContent;
    /** Invoked when the button's action is 'scroll'. */
    onScrollRequest?: () => void;
    /**
     * Set in the admin preview: renders the button as plain text so clicking
     * around a preview cannot navigate the admin away from unsaved edits.
     */
    isPreview?: boolean;
}

const BADGE_POSITION_CLASS: Record<HeroBadgePosition, string> = {
    'top-left': 'top-10 left-10',
    'top-right': 'top-10 right-10',
    'bottom-left': 'bottom-10 left-10',
    'bottom-right': 'bottom-10 right-10',
};

/**
 * The storefront's dashboard hero, rendered from admin-authored content.
 *
 * Shared by the dashboard and the admin editor's preview tab, so the preview is
 * the real hero fed unsaved values rather than a lookalike that can drift.
 *
 * Every colour is an inline style rather than a Tailwind class: the palette is
 * only known at runtime, and Tailwind can only generate classes it saw at build
 * time. The opacity steps below (0.4 on the kicker, 0.5 on the blurb, 0.5 on the
 * backdrop) are the ones the hand-written hero used, so the defaults reproduce it.
 */
export default function HomeHero({ hero, onScrollRequest, isPreview = false }: HomeHeroProps) {
    const { kicker, headlineLines, subtitle, subtitleColor, cta, image, badges } = hero;

    return (
        <section className="relative flex flex-col lg:flex-row items-center justify-between min-h-[400px] lg:min-h-[500px] gap-8 py-6 lg:py-12">
            {/* Text Content */}
            <div className="flex-1 max-w-[500px] z-10">
                {kicker.text && (
                    <div className="inline-flex items-center gap-1.5 mb-5 animate-in fade-in slide-in-from-left-4 duration-700">
                        <span
                            className="size-1 rounded-full"
                            style={{ backgroundColor: kicker.dotColor }}
                        />
                        <span
                            className="text-[10px] font-black uppercase tracking-[0.3em]"
                            style={{ color: withAlpha(kicker.textColor, 0.4) }}
                        >
                            {kicker.text}
                        </span>
                    </div>
                )}

                {headlineLines.length > 0 && (
                    <h1 className="text-[44px] lg:text-[56px] font-black leading-[0.95] tracking-tight mb-6 animate-in fade-in slide-in-from-left-6 duration-1000">
                        {headlineLines.map((line, index) => (
                            <Fragment key={`${line.text}-${index}`}>
                                {index > 0 && <br />}
                                <span style={{ color: line.color }}>{line.text}</span>
                            </Fragment>
                        ))}
                    </h1>
                )}

                {subtitle && (
                    <p
                        className="whitespace-pre-line text-base font-medium leading-relaxed max-w-[380px] mb-8 animate-in fade-in slide-in-from-left-8 duration-1000 delay-150"
                        style={{ color: withAlpha(subtitleColor, 0.5) }}
                    >
                        {subtitle}
                    </p>
                )}

                {cta.enabled && cta.label && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
                        <HeroCta
                            cta={cta}
                            isPreview={isPreview}
                            onScrollRequest={onScrollRequest}
                        />
                    </div>
                )}
            </div>

            {/* Image */}
            <div className="flex-1 relative w-full max-w-[600px] aspect-[3/2] group">
                <div
                    className="absolute inset-0 rounded-[20px] lg:rounded-[32px] transform rotate-1 group-hover:rotate-0 transition-transform duration-1000"
                    style={{ backgroundColor: withAlpha(image.backdropColor, 0.5) }}
                />

                <div className="relative w-full h-full rounded-[20px] lg:rounded-[32px] overflow-hidden shadow-2xl transition-transform duration-1000 hover:scale-[1.02]">
                    {image.url ? (
                        <img
                            src={resolveImageUrl(image.url)}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: image.backdropColor }}
                        >
                            <span
                                className="material-symbols-outlined text-[64px]"
                                style={{ color: withAlpha(subtitleColor, 0.15) }}
                            >
                                image
                            </span>
                        </div>
                    )}

                    {badges.enabled &&
                        badges.items.map((badge, index) => (
                            <div
                                key={`${badge.icon}-${index}`}
                                className={`absolute ${BADGE_POSITION_CLASS[badge.position]} p-4 rounded-full shadow-lg border backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
                                    index > 0 ? 'delay-100' : ''
                                }`}
                                style={{
                                    // The pill and its edge are tints of the badge's own
                                    // colour, which is what the original two did by hand.
                                    backgroundColor: withAlpha(badge.color, 0.15),
                                    borderColor: withAlpha(badge.color, 0.25),
                                }}
                            >
                                <span
                                    className="material-symbols-outlined text-3xl"
                                    style={{ color: badge.color }}
                                >
                                    {badge.icon}
                                </span>
                            </div>
                        ))}
                </div>
            </div>
        </section>
    );
}

function HeroCta({
    cta,
    isPreview,
    onScrollRequest,
}: {
    cta: HomeHeroContent['cta'];
    isPreview: boolean;
    onScrollRequest?: () => void;
}) {
    const className =
        'themed-hover-surface h-14 px-8 font-black text-base rounded-full inline-flex items-center gap-2.5 transform hover:scale-[1.05] active:scale-95 cursor-pointer';

    const shadowTint = withAlpha(cta.backgroundColor, 0.2);
    const style = {
        '--themed-surface': cta.backgroundColor,
        '--themed-surface-hover': mix(cta.backgroundColor, '#000000', 0.08),
        color: cta.textColor,
        boxShadow: `0 20px 25px -5px ${shadowTint}, 0 8px 10px -6px ${shadowTint}`,
    } as CSSProperties;

    const inner: ReactNode = (
        <>
            {cta.label}
            {cta.icon && (
                <span className="material-symbols-outlined font-black text-xl">{cta.icon}</span>
            )}
        </>
    );

    if (isPreview) {
        return (
            <span className={className} style={style}>
                {inner}
            </span>
        );
    }

    if (cta.action === 'link' && cta.href) {
        // Internal paths go through the router so the app does not reload; anything
        // else (https, mailto, tel) is an ordinary link.
        return cta.href.startsWith('/') ? (
            <Link to={cta.href} className={className} style={style}>
                {inner}
            </Link>
        ) : (
            <a href={cta.href} className={className} style={style}>
                {inner}
            </a>
        );
    }

    return (
        <button type="button" onClick={onScrollRequest} className={className} style={style}>
            {inner}
        </button>
    );
}
