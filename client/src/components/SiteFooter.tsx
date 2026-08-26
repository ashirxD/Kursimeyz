import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import SocialIcon from "@/components/SocialIcon";
import { SOCIAL_LABELS } from "@/components/socialPlatforms";
import type { FooterContent, FooterLink } from "@/hooks/useFooter";
import { useProductTypes } from "@/hooks/useProductTypes";
import { withAlpha } from "@/utils/themeColor";

interface SiteFooterProps {
  content: FooterContent;
  /** In the admin preview nothing navigates away from the editor. */
  isPreview?: boolean;
}

/**
 * The storefront footer. Every word, link and colour comes from the admin's
 * footer document (see server/utils/footerContent.js); the collections column is
 * the exception, built from the product types the same way the shop nav is, so a
 * new kind of furniture appears here without anyone editing the footer.
 */
export default function SiteFooter({
  content,
  isPreview = false,
}: SiteFooterProps) {
  const { productTypes } = useProductTypes();
  const { theme, brand, collections, columns, contact, social, bottom } = content;

  const ink = theme.textColor;
  const accent = theme.accentColor;

  // The muted variants the design leans on. Opacity utilities cannot be used —
  // the colours are admin-chosen, so nothing about them exists at build time.
  const muted = withAlpha(ink, 0.55);
  const hairline = withAlpha(ink, 0.12);

  const collectionLinks: FooterLink[] = productTypes.map((type) => ({
    label: type.pluralName,
    href: `/shop/${type.pluralSlug}`,
  }));

  const showCollections = collections.enabled && collectionLinks.length > 0;
  const hasContactDetails =
    contact.address || contact.phone || contact.email || contact.hours;

  return (
    <footer
      className="mt-24 rounded-t-[40px] relative overflow-hidden"
      style={{ backgroundColor: theme.backgroundColor, color: ink }}
    >
      {/* A soft wash of the accent in the top corner, so the panel reads as
          designed rather than as a flat block of colour. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-24 size-[420px] rounded-full blur-3xl"
        style={{ backgroundColor: withAlpha(accent, 0.16) }}
      />

      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-10">
        <div className="grid gap-14 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            {brand.showLogo && (
              <BrandLogo imageClassName="h-11 w-auto max-w-[190px]" />
            )}

            {brand.tagline && (
              <p
                className="text-[14px] font-medium leading-relaxed max-w-sm whitespace-pre-line"
                style={{ color: muted }}
              >
                {brand.tagline}
              </p>
            )}

            {social.enabled && social.items.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5">
                {social.items.map((item) => (
                  <SocialChip
                    key={`${item.platform}-${item.href}`}
                    href={item.href}
                    label={SOCIAL_LABELS[item.platform]}
                    ink={ink}
                    accent={accent}
                    isPreview={isPreview}
                  >
                    <SocialIcon platform={item.platform} />
                  </SocialChip>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
            {showCollections && (
              <FooterColumnBlock
                heading={collections.heading}
                accent={accent}
                ink={ink}
              >
                {collectionLinks.map((link) => (
                  <FooterNavLink
                    key={link.href}
                    link={link}
                    ink={ink}
                    accent={accent}
                    isPreview={isPreview}
                  />
                ))}
              </FooterColumnBlock>
            )}

            {columns.map((column) => (
              <FooterColumnBlock
                key={column.heading || column.links[0]?.href}
                heading={column.heading}
                accent={accent}
                ink={ink}
              >
                {column.links.map((link) => (
                  <FooterNavLink
                    key={`${link.label}-${link.href}`}
                    link={link}
                    ink={ink}
                    accent={accent}
                    isPreview={isPreview}
                  />
                ))}
              </FooterColumnBlock>
            ))}

            {contact.enabled && hasContactDetails && (
              <FooterColumnBlock
                heading={contact.heading}
                accent={accent}
                ink={ink}
              >
                {contact.address && (
                  <ContactRow
                    icon="location_on"
                    accent={accent}
                    ink={ink}
                    href={isPreview ? undefined : contact.mapUrl || undefined}
                    external
                  >
                    {contact.address}
                    {contact.mapUrl && (
                      <span
                        className="block mt-1 text-[11px] font-black uppercase tracking-widest"
                        style={{ color: accent }}
                      >
                        Get directions
                      </span>
                    )}
                  </ContactRow>
                )}
                {contact.phone && (
                  <ContactRow
                    icon="call"
                    accent={accent}
                    ink={ink}
                    href={isPreview ? undefined : `tel:${contact.phone.replace(/\s/g, "")}`}
                  >
                    {contact.phone}
                  </ContactRow>
                )}
                {contact.email && (
                  <ContactRow
                    icon="mail"
                    accent={accent}
                    ink={ink}
                    href={isPreview ? undefined : `mailto:${contact.email}`}
                  >
                    {contact.email}
                  </ContactRow>
                )}
                {contact.hours && (
                  <ContactRow icon="schedule" accent={accent} ink={ink}>
                    {contact.hours}
                  </ContactRow>
                )}
              </FooterColumnBlock>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-8 border-t flex flex-col-reverse md:flex-row md:items-center justify-between gap-5"
          style={{ borderColor: hairline }}
        >
          <p
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: withAlpha(ink, 0.4) }}
          >
            {bottom.copyright.replace("{year}", String(new Date().getFullYear()))}
          </p>

          {bottom.links.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
              {bottom.links.map((link) => (
                <FooterNavLink
                  key={`${link.label}-${link.href}`}
                  link={link}
                  ink={ink}
                  accent={accent}
                  isPreview={isPreview}
                  className="text-[11px] font-bold uppercase tracking-widest"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterColumnBlock({
  heading,
  accent,
  ink,
  children,
}: {
  heading: string;
  accent: string;
  ink: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-5 min-w-0">
      {heading && (
        <h3
          className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
          style={{ color: withAlpha(ink, 0.9) }}
        >
          <span
            className="inline-block size-1.5 rounded-full shrink-0"
            style={{ backgroundColor: accent }}
          />
          {heading}
        </h3>
      )}
      <div className="space-y-3.5">{children}</div>
    </div>
  );
}

/**
 * Internal paths go through the router so the app does not reload; external
 * links open in a new tab, while mailto: and tel: stay in the current one.
 */
function FooterNavLink({
  link,
  ink,
  accent,
  isPreview,
  className = "text-[13px] font-bold",
}: {
  link: FooterLink;
  ink: string;
  accent: string;
  isPreview: boolean;
  className?: string;
}) {
  const style = {
    "--themed-text": withAlpha(ink, 0.6),
    "--themed-text-hover": accent,
  } as CSSProperties;

  const shared = `themed-hover-text block truncate ${className}`;

  if (isPreview) {
    return (
      <span className={shared} style={style}>
        {link.label}
      </span>
    );
  }

  if (link.href.startsWith("/")) {
    return (
      <Link to={link.href} className={shared} style={style}>
        {link.label}
      </Link>
    );
  }

  const opensNewTab = /^https?:\/\//i.test(link.href);

  return (
    <a
      href={link.href}
      className={shared}
      style={style}
      {...(opensNewTab ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {link.label}
    </a>
  );
}

function ContactRow({
  icon,
  accent,
  ink,
  href,
  external = false,
  children,
}: {
  icon: string;
  accent: string;
  ink: string;
  href?: string;
  /** Opens in a new tab — for the maps link, not for tel:/mailto:. */
  external?: boolean;
  children: ReactNode;
}) {
  const body = (
    <>
      <span
        className="material-symbols-outlined text-[18px] shrink-0 mt-0.5"
        style={{ color: accent }}
      >
        {icon}
      </span>
      <span className="whitespace-pre-line">{children}</span>
    </>
  );

  const className = "flex gap-3 text-[13px] font-medium leading-relaxed";
  const style = {
    "--themed-text": withAlpha(ink, 0.6),
    "--themed-text-hover": accent,
  } as CSSProperties;

  if (!href) {
    return (
      <p className={className} style={{ color: withAlpha(ink, 0.6) }}>
        {body}
      </p>
    );
  }

  return (
    <a
      href={href}
      className={`themed-hover-text ${className}`}
      style={style}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {body}
    </a>
  );
}

function SocialChip({
  href,
  label,
  ink,
  accent,
  isPreview,
  children,
}: {
  href: string;
  label: string;
  ink: string;
  accent: string;
  isPreview: boolean;
  children: ReactNode;
}) {
  const className =
    "themed-hover-surface size-10 rounded-full flex items-center justify-center transform hover:scale-110";
  const style = {
    "--themed-surface": withAlpha(ink, 0.08),
    "--themed-surface-hover": accent,
    color: ink,
    border: `1px solid ${withAlpha(ink, 0.12)}`,
  } as CSSProperties;

  if (isPreview) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
