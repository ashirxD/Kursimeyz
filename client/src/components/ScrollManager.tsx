import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * React Router keeps the scroll position when the page changes, so opening a
 * product from halfway down the shop used to land halfway down the product.
 * New pages now start at the top, #anchors scroll to their section, and the
 * back button is left alone so the browser can restore where the shopper was.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      // The target may render a moment after navigation (data still loading).
      let attempts = 0;
      const timer = window.setInterval(() => {
        const target = document.getElementById(id);
        attempts += 1;

        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
          window.clearInterval(timer);
        } else if (attempts >= 20) {
          window.clearInterval(timer);
        }
      }, 100);

      return () => window.clearInterval(timer);
    }

    if (navigationType !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, navigationType]);

  return null;
}
