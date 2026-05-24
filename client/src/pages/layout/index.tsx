import { Outlet } from "react-router-dom";
import Header from "./Header";
import WhatsAppButton from "../../components/WhatsAppButton";
import ReviewPromptProvider from "../../components/ReviewPromptProvider";

export default function UserLayout() {
  return (
    <ReviewPromptProvider>
      <div className="min-h-screen bg-white font-sans overflow-x-hidden pb-20 md:pb-0">
        <main className="w-full">
          <Header />
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
            <Outlet />
          </div>
        </main>
        <WhatsAppButton />
      </div>
    </ReviewPromptProvider>
  );
}
