import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type {
    AboutPageContent,
    AboutSectionKey,
    AboutTheme,
} from '@/hooks/useAboutPage';
import { resolveImageUrl } from '@/utils/imageUrl';
import { mix, readableTextColor, withAlpha } from '@/utils/themeColor';

interface AboutContentProps {
    content: AboutPageContent;
    /**
     * Set in the admin preview: renders the links as plain text so clicking
     * around a preview cannot navigate the admin away from unsaved edits.
     */
    isPreview?: boolean;
}

/**
 * Renders the storefront About page from admin-authored content.
 *
 * Shared by the public page and the admin editor's preview tab, which is the
 * whole point — the preview is the real page, fed unsaved values, not a
 * lookalike that can drift from it.
 *
 * Every colour is an inline style rather than a Tailwind class: the palette is
 * only known at runtime, and Tailwind can only generate classes it saw at build
 * time. The opacity steps below (0.4 / 0.5 / 0.6) are the ones the hand-written
 * page used, so a default theme reproduces it exactly.
 */
export default function AboutContent({ content, isPreview = false }: AboutContentProps) {
    const { theme } = content;

    const sections: Record<AboutSectionKey, ReactNode> = {
        hero: content.hero.enabled ? <HeroSection key="hero" content={content} /> : null,
        values: content.values.enabled ? <ValuesSection key="values" content={content} /> : null,
        story: content.story.enabled ? <StorySection key="story" content={content} /> : null,
        stats: content.stats.enabled ? <StatsSection key="stats" content={content} /> : null,
        contact: content.contact.enabled ? (
            <ContactSection key="contact" content={content} isPreview={isPreview} />
        ) : null,
        backLink: content.backLink.enabled ? (
            <BackLinkSection key="backLink" content={content} isPreview={isPreview} />
        ) : null,
    };

    return (
        <div
            className="about-bleed pt-24 pb-16 max-w-[1200px] mx-auto px-6 md:px-10"
            style={
                {
                    // Unset when the admin leaves it blank, so the site background shows.
                    '--about-page-bg': theme.pageBackground || undefined,
                } as CSSProperties
            }
        >
            <div className="space-y-20">
                {content.sectionOrder.map((key) => sections[key])}
            </div>
        </div>
    );
}

/** The dot-plus-label kicker that sits above three of the headings. */
function Eyebrow({ text, theme }: { text: string; theme: AboutTheme }) {
    if (!text) return null;

    return (
        <div className="inline-flex items-center gap-1.5 mb-5">
            <span
                className="size-1 rounded-full"
                style={{ backgroundColor: theme.accentColor }}
            />
            <span
                className="text-[10px] font-black uppercase tracking-[0.3em]"
                style={{ color: withAlpha(theme.bodyColor, 0.4) }}
            >
                {text}
            </span>
        </div>
    );
}

/**
 * Renders one admin paragraph. Text is plain by design, but newlines the admin
 * typed are honoured rather than collapsed into one run-on block.
 */
function Paragraph({
    text,
    className,
    style,
}: {
    text: string;
    className: string;
    style: CSSProperties;
}) {
    return (
        <p className={`whitespace-pre-line ${className}`} style={style}>
            {text}
        </p>
    );
}

function HeroSection({ content }: { content: AboutPageContent }) {
    const { theme, hero } = content;

    return (
        <section className="text-center">
            <Eyebrow text={hero.eyebrow} theme={theme} />

            {(hero.titleLine1 || hero.titleLine2) && (
                <h1
                    className="text-[40px] lg:text-[52px] font-black leading-[1] tracking-tight mb-6"
                    style={{ color: theme.headingColor }}
                >
                    {hero.titleLine1}
                    {hero.titleLine1 && hero.titleLine2 && <br />}
                    {hero.titleLine2 && (
                        <span style={{ color: theme.accentColor }}>{hero.titleLine2}</span>
                    )}
                </h1>
            )}

            {hero.subtitle && (
                <Paragraph
                    text={hero.subtitle}
                    className="text-lg font-medium leading-relaxed max-w-[600px] mx-auto"
                    style={{ color: withAlpha(theme.bodyColor, 0.5) }}
                />
            )}
        </section>
    );
}

function ValuesSection({ content }: { content: AboutPageContent }) {
    const { theme, values } = content;

    if (values.items.length === 0) return null;

    const iconColor = readableTextColor(theme.accentColor, theme.headingColor);
    const iconShadow = withAlpha(theme.accentColor, 0.2);

    return (
        <section>
            {(values.eyebrow || values.heading) && (
                <div className="text-center mb-12">
                    <Eyebrow text={values.eyebrow} theme={theme} />
                    {values.heading && (
                        <h2
                            className="text-[32px] font-black tracking-tight leading-tight"
                            style={{ color: theme.headingColor }}
                        >
                            {values.heading}
                        </h2>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {values.items.map((item, index) => (
                    <div
                        key={`${item.title}-${index}`}
                        className="themed-hover-surface text-center p-8 rounded-3xl"
                        style={
                            {
                                '--themed-surface': theme.cardBackground,
                                '--themed-surface-hover': mix(
                                    theme.cardBackground,
                                    theme.headingColor,
                                    0.06,
                                ),
                            } as CSSProperties
                        }
                    >
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                            style={{
                                backgroundColor: theme.accentColor,
                                boxShadow: `0 10px 15px -3px ${iconShadow}, 0 4px 6px -4px ${iconShadow}`,
                            }}
                        >
                            <span
                                className="material-symbols-outlined text-3xl"
                                style={{ color: iconColor }}
                            >
                                {item.icon}
                            </span>
                        </div>

                        {item.title && (
                            <h3
                                className="text-xl font-black mb-3"
                                style={{ color: theme.headingColor }}
                            >
                                {item.title}
                            </h3>
                        )}

                        {item.description && (
                            <Paragraph
                                text={item.description}
                                className="text-[14px] font-medium leading-relaxed"
                                style={{ color: withAlpha(theme.bodyColor, 0.5) }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

function StorySection({ content }: { content: AboutPageContent }) {
    const { theme, story } = content;

    // The badge floats on the photo, so it takes the page colour to stay legible
    // against a re-themed background rather than staying hard-coded white.
    const badgeBackground = theme.pageBackground || '#ffffff';
    const badgeLabelColor = withAlpha(
        readableTextColor(badgeBackground, theme.bodyColor),
        0.6,
    );

    return (
        <section>
            <div
                className={`flex flex-col items-center gap-12 ${
                    story.imagePosition === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'
                }`}
            >
                <div className="flex-1">
                    <Eyebrow text={story.eyebrow} theme={theme} />

                    {story.heading && (
                        <h2
                            className="text-[32px] font-black tracking-tight leading-tight mb-5"
                            style={{ color: theme.headingColor }}
                        >
                            {story.heading}
                        </h2>
                    )}

                    <div className="space-y-4">
                        {story.paragraphs.map((paragraph, index) => (
                            <Paragraph
                                key={index}
                                text={paragraph}
                                className="text-[15px] font-medium leading-relaxed"
                                style={{ color: withAlpha(theme.bodyColor, 0.6) }}
                            />
                        ))}
                    </div>
                </div>

                {story.image && (
                    <div className="flex-1 relative w-full">
                        <div className="aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl">
                            <img
                                src={resolveImageUrl(story.image)}
                                alt={story.imageAlt}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {story.badgeEnabled && (story.badgeValue || story.badgeLabel) && (
                            <div
                                className="absolute -bottom-6 -left-6 rounded-2xl p-5 shadow-xl"
                                style={{ backgroundColor: badgeBackground }}
                            >
                                {story.badgeValue && (
                                    <div
                                        className="text-[32px] font-black"
                                        style={{ color: theme.accentColor }}
                                    >
                                        {story.badgeValue}
                                    </div>
                                )}
                                {story.badgeLabel && (
                                    <div
                                        className="text-[12px] font-bold uppercase tracking-wider"
                                        style={{ color: badgeLabelColor }}
                                    >
                                        {story.badgeLabel}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

function StatsSection({ content }: { content: AboutPageContent }) {
    const { theme, stats } = content;

    if (stats.items.length === 0) return null;

    return (
        <section
            className="py-12 border-y"
            style={{ borderColor: withAlpha(theme.bodyColor, 0.1) }}
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.items.map((stat, index) => (
                    <div key={`${stat.label}-${index}`} className="text-center">
                        <div
                            className="text-[36px] font-black mb-1"
                            style={{ color: theme.headingColor }}
                        >
                            {stat.value}
                        </div>
                        <div
                            className="text-[12px] font-bold uppercase tracking-wider"
                            style={{ color: withAlpha(theme.bodyColor, 0.4) }}
                        >
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function ContactSection({
    content,
    isPreview,
}: {
    content: AboutPageContent;
    isPreview: boolean;
}) {
    const { theme, contact } = content;

    // One background choice drives the text colour, so the panel cannot end up
    // with white text on a pale colour.
    const panelText = readableTextColor(theme.contactBackground, theme.headingColor);
    const accentText = readableTextColor(theme.accentColor, theme.headingColor);

    return (
        <section>
            <div
                className="rounded-[32px] p-10 md:p-16 text-center"
                style={{ backgroundColor: theme.contactBackground }}
            >
                {contact.heading && (
                    <h2
                        className="text-[28px] md:text-[36px] font-black tracking-tight mb-4"
                        style={{ color: panelText }}
                    >
                        {contact.heading}
                    </h2>
                )}

                {contact.subtitle && (
                    <Paragraph
                        text={contact.subtitle}
                        className="font-medium mb-10 max-w-[500px] mx-auto"
                        style={{ color: withAlpha(panelText, 0.6) }}
                    />
                )}

                {contact.links.length > 0 && (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        {contact.links.map((link, index) => {
                            const isAccent = link.style === 'accent';

                            const surface = isAccent
                                ? theme.accentColor
                                : withAlpha(panelText, 0.1);
                            const surfaceHover = isAccent
                                ? mix(theme.accentColor, '#000000', 0.08)
                                : withAlpha(panelText, 0.2);

                            const style = {
                                '--themed-surface': surface,
                                '--themed-surface-hover': surfaceHover,
                                color: isAccent ? accentText : panelText,
                            } as CSSProperties;

                            const className =
                                'themed-hover-surface flex items-center gap-3 px-6 py-4 rounded-full';

                            const inner = (
                                <>
                                    <span className="material-symbols-outlined text-[24px]">
                                        {link.icon}
                                    </span>
                                    <span className="text-[14px] font-bold">{link.label}</span>
                                </>
                            );

                            return isPreview ? (
                                <span key={index} className={className} style={style}>
                                    {inner}
                                </span>
                            ) : (
                                <a
                                    key={index}
                                    href={link.href}
                                    className={className}
                                    style={style}
                                >
                                    {inner}
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

function BackLinkSection({
    content,
    isPreview,
}: {
    content: AboutPageContent;
    isPreview: boolean;
}) {
    const { theme, backLink } = content;

    if (!backLink.label) return null;

    const className =
        'themed-hover-text inline-flex items-center gap-2 text-[14px] font-bold';
    const style = {
        '--themed-text': withAlpha(theme.bodyColor, 0.6),
        '--themed-text-hover': theme.bodyColor,
    } as CSSProperties;

    const inner = (
        <>
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            {backLink.label}
        </>
    );

    return (
        <div className="text-center">
            {isPreview ? (
                <span className={className} style={style}>
                    {inner}
                </span>
            ) : (
                <Link to="/" className={className} style={style}>
                    {inner}
                </Link>
            )}
        </div>
    );
}
