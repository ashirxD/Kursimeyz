import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function UserLayout() {
    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden">
            <main className="w-full">
                <Header />
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
