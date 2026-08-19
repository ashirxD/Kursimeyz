import { Link } from "react-router-dom";
import AboutContent from "@/components/AboutContent";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAboutPage } from "@/hooks/useAboutPage";

/**
 * Everything on this page — copy, colours, icons, images, section order — is
 * authored by the admin under /admin/about. The layout lives in AboutContent,
 * which the editor's preview tab renders too.
 */
export default function About() {
  const { content, isLoading, error } = useAboutPage();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !content) {
    return (
      <div className="pt-32 pb-24 text-center">
        <span className="material-symbols-outlined text-[64px] text-[#1a2f1a]/10 mb-4">
          sentiment_dissatisfied
        </span>
        <p className="text-[#1a2f1a]/40 font-bold text-lg mb-2">
          We could not load this page
        </p>
        <p className="text-[#1a2f1a]/30 text-sm font-medium mb-8">
          Please try again in a moment.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[14px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Home
        </Link>
      </div>
    );
  }

  return <AboutContent content={content} />;
}
