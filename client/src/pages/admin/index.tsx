import { Outlet } from "react-router-dom";
import AdminSidebar from "@/pages/admin/layout/Sidebar";
import { useSidebarStore } from "@/stores";

export default function AdminLayout() {
  const { isSidebarOpen, closeSidebar } = useSidebarStore();

  return (
    <div className="flex h-screen bg-oatmeal font-sans overflow-hidden p-0 md:p-3 gap-0 md:gap-3 relative">
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={closeSidebar}
        />
      )}

      <AdminSidebar />

      <main className="flex-1 overflow-y-auto custom-scrollbar h-full w-full">
        <div className="max-w-[1440px] mx-auto p-0 md:p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
