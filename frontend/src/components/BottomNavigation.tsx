import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, History, User } from 'lucide-react';

export default function BottomNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: Home, path: '/', label: 'Inicio' },
        { icon: Search, path: '/market', label: 'Eexplorar' },
        { icon: PlusCircle, path: '/loan/new', label: 'Pedir', isAction: true },
        { icon: History, path: '/loans', label: 'Actividad' },
        { icon: User, path: '/profile', label: 'Perfil' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-2xl safe-area-bottom lg:hidden">
            {navItems.map((item) => (
                <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex flex-col items-center transition-all duration-300 relative ${item.isAction ? 'mb-8 translate-y-[-10px]' : ''}`}
                >
                    {item.isAction ? (
                        <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 active:scale-90 transition-transform ring-4 ring-white">
                            <item.icon size={28} strokeWidth={2.5} />
                        </div>
                    ) : (
                        <div className={`flex flex-col items-center gap-1 ${isActive(item.path) ? 'text-[var(--primary)]' : 'text-gray-300'}`}>
                            <item.icon
                                size={isActive(item.path) ? 24 : 22}
                                strokeWidth={isActive(item.path) ? 3 : 2}
                                className={`transition-all ${isActive(item.path) ? 'scale-110 drop-shadow-sm' : ''}`}
                            />
                            <span className={`text-[8px] font-black uppercase tracking-widest transition-opacity ${isActive(item.path) ? 'opacity-100' : 'opacity-0'}`}>
                                {item.label}
                            </span>
                            {isActive(item.path) && (
                                <div className="absolute -bottom-2 w-1 h-1 bg-[var(--primary)] rounded-full animate-pulse"></div>
                            )}
                        </div>
                    )}
                </button>
            ))}
        </nav>
    );
}
