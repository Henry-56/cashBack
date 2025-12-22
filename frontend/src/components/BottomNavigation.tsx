import React from 'react';
import { Home, Search, Plus, FileText, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const BottomNavigation = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-6 flex justify-between items-center z-50 rounded-t-2xl shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            <Link to="/" className={`p-2 ${isActive('/') ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
            </Link>

            <button className="p-2 text-gray-400">
                <Search size={24} />
            </button>

            {/* Floating Action Button */}
            <div className="-mt-8">
                <Link to="/loan/new" className="bg-[var(--primary-light)] text-white p-4 rounded-full shadow-lg flex items-center justify-center w-14 h-14 hover:scale-105 transition-transform">
                    <Plus size={28} />
                </Link>
            </div>

            <Link to="/loans" className={`p-2 ${isActive('/loans') ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                <FileText size={24} strokeWidth={isActive('/loans') ? 2.5 : 2} />
            </Link>

            <Link to="/profile" className={`p-2 ${isActive('/profile') ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                <User size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
            </Link>
        </div>
    );
};
