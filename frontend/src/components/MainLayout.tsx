import React from 'react';
import BottomNavigation from './BottomNavigation';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MainLayoutProps {
    children: React.ReactNode;
    showNav?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, showNav = true }) => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col min-h-screen bg-[var(--bg-light)]">
            {/* Desktop Header */}
            <header className="hidden lg:flex sticky top-0 z-40 w-full bg-white border-b border-gray-100 py-4 shadow-sm">
                <div className="container-premium flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">C</span>
                        </div>
                        <span className="text-2xl font-black text-[var(--primary)] tracking-tight">Cashback</span>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="text-gray-400 hover:text-[var(--primary)] transition-colors relative">
                            <Bell size={22} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center space-x-3 border-l pl-6 border-gray-100">
                            <div className="text-right">
                                <p className="text-sm font-bold text-[var(--primary)]">{user?.fullName}</p>
                                <p className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
                            </div>
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-[var(--primary)]">
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 pb-24 lg:pb-8">
                <div className="container-premium py-6 lg:py-10">
                    {children}
                </div>
            </main>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
                {showNav && <BottomNavigation />}
            </div>
        </div>
    );
};
