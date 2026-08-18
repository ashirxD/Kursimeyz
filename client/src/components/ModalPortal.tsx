import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders modal content into <body>.
 *
 * A `position: fixed` overlay resolves against the nearest ancestor carrying a
 * transform rather than against the viewport. The admin sidebar slides with
 * `translate-x` and clips with `overflow-hidden`, so a modal mounted inside it
 * gets squeezed into the sidebar column instead of covering the screen.
 * Portalling past every ancestor is the only reliable fix.
 *
 * Background scroll is locked while a modal is open, restoring whatever the
 * page had before so nested or stacked modals unwind cleanly.
 */
export default function ModalPortal({ children }: { children: ReactNode }) {
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    return createPortal(children, document.body);
}
