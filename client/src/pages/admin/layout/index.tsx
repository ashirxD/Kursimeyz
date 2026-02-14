import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/layout/Sidebar';

export default function AdminLayout() {
    return (
        <div className="flex h-screen bg-oatmeal font-sans overflow-hidden p-3 gap-3">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-[1440px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
