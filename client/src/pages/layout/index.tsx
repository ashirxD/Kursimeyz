import { Outlet } from "react-router-dom";
import Header from "./Header";
import SiteFooter from "../../components/SiteFooter";
import WhatsAppButton from "../../components/WhatsAppButton";
import ReviewPromptProvider from "../../components/ReviewPromptProvider";
import { useFooter } from "../../hooks/useFooter";

export default function UserLayout() {
  // Authored under /admin/footer. Nothing renders until it loads, so the page
  // never shows a half-built footer that then shifts.
  const { content: footer } = useFooter();

  return (
    <ReviewPromptProvider>
      <div className="min-h-screen bg-white font-sans overflow-x-hidden pb-20 md:pb-0">
        <main className="w-full">
          <Header />
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
            <Outlet />
          </div>
        </main>
        {/* Outside the container: the footer is a full-bleed panel. */}
        {footer?.enabled && <SiteFooter content={footer} />}
        <WhatsAppButton />
      </div>
    </ReviewPromptProvider>
  );
}
