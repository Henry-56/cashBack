import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../components/MainLayout';
import { LogOut, Star, Mail, Phone, User as UserIcon, ShieldCheck, TrendingUp, Award, Settings, ChevronRight } from 'lucide-react';

export default function Profile() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <MainLayout>
            <div className="animate-enter pb-24">
                {/* Profile Header */}
                <div className="bg-[var(--primary)] pt-12 pb-24 px-8 rounded-b-[4rem] relative overflow-hidden mb-12 shadow-2xl">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="bg-[var(--accent)] w-32 h-32 rounded-[3.5rem] flex items-center justify-center text-[var(--primary)] font-black text-5xl mb-6 border-4 border-white shadow-premium ring-8 ring-white/10 animate-scale-in">
                            {user.fullName?.charAt(0) || 'U'}
                        </div>
                        <h2 className="text-white text-3xl font-black tracking-tighter mb-2">{user.fullName}</h2>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <Star size={16} className="text-[var(--accent)] fill-current" />
                            <span className="text-white font-black text-sm tracking-widest">{user.rating || '5.0'}</span>
                            <span className="text-white/40 text-[10px] uppercase font-black tracking-widest ml-1">Puntaje</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="px-6 -mt-20 relative z-20 grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-premium border border-gray-50 flex flex-col items-center text-center">
                        <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 mb-3"><Award size={24} /></div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Nivel</p>
                        <p className="text-lg font-black text-[var(--primary)]">Plata</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-premium border border-gray-50 flex flex-col items-center text-center">
                        <div className="bg-teal-50 p-3 rounded-2xl text-teal-600 mb-3"><ShieldCheck size={24} /></div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Confianza</p>
                        <p className="text-lg font-black text-teal-600">Verificado</p>
                    </div>
                </div>

                {/* Profile Sections */}
                <div className="px-6 space-y-6">
                    {/* Information Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-gray-50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-[var(--primary)] tracking-tight">Información de Cuenta</h3>
                            <button className="text-indigo-600 hover:text-indigo-900 transition-colors"><Settings size={20} /></button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="p-4 bg-gray-50 rounded-2xl text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                                    <UserIcon size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identificación</p>
                                    <p className="text-sm font-black text-[var(--primary)]">{user.documentNumber || '---------'}</p>
                                </div>
                                <ChevronRight size={16} className="text-gray-200" />
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="p-4 bg-gray-50 rounded-2xl text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                                    <Mail size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Principal</p>
                                    <p className="text-sm font-black text-[var(--primary)]">{user.email}</p>
                                </div>
                                <ChevronRight size={16} className="text-gray-200" />
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="p-4 bg-gray-50 rounded-2xl text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                                    <Phone size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Teléfono de Pago</p>
                                    <p className="text-sm font-black text-[var(--primary)]">{user.phone || 'No registrado'}</p>
                                </div>
                                <ChevronRight size={16} className="text-gray-200" />
                            </div>
                        </div>
                    </div>

                    {/* Analytics Preview */}
                    <div className="bg-indigo-900/5 p-8 rounded-[2.5rem] border border-indigo-100/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg"><TrendingUp size={24} /></div>
                            <div>
                                <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tight">Estadísticas de Préstamos</h4>
                                <p className="text-[10px] text-indigo-600 font-bold">Ver historial detallado</p>
                            </div>
                        </div>
                        <ChevronRight size={24} className="text-indigo-300" />
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="w-full bg-white text-red-500 font-black py-6 rounded-[2rem] shadow-premium border border-red-50 hover:bg-red-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95 mb-8"
                    >
                        <LogOut size={24} />
                        Cerrar Sesión Segura
                    </button>

                    <div className="text-center pt-4">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">Cashback Security v4.5.2</span>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
