import React from 'react';
import { BottomNavigation } from './BottomNavigation';

interface MainLayoutProps {
    children: React.ReactNode;
    showNav?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, showNav = true }) => {
    return (
        <div className="flex flex-col min-h-screen relative pb-20">
            {children}
            {showNav && <BottomNavigation />}
        </div>
    );
};
