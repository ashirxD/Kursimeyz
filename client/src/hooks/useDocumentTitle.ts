import { useEffect } from "react";

export const SITE_NAME = "Kursimeyz";
const DEFAULT_TITLE = `${SITE_NAME} — Handcrafted chairs, tables & sofas`;

/**
 * Puts the page's own name in the browser tab and history. Without it every
 * page is just "Kursimeyz", which makes tabs and bookmarks indistinguishable.
 * Pass nothing while the name is still loading and the default stays.
 */
export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}
