
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../components/MainLayout';
import { LogOut, Star, Mail, Phone, User as UserIcon } from 'lucide-react';

export default function Profile() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <MainLayout>
            <div className="bg-[var(--primary)] pt-10 pb-20 px-6 rounded-b-[2.5rem] shadow-lg relative mb-16">
                <div className="flex flex-col items-center">
                    <div className="bg-[var(--accent)] w-24 h-24 rounded-full flex items-center justify-center text-[var(--primary)] font-bold text-4xl mb-4 border-4 border-white shadow-xl">
                        {user.fullName?.charAt(0) || 'U'}
                    </div>
                    <h2 className="text-white text-2xl font-bold">{user.fullName}</h2>
                    <div className="flex items-center text-yellow-400 mt-2 bg-white/10 px-3 py-1 rounded-full">
                        <Star size={16} className="fill-current mr-1" />
                        <span className="font-bold">{user.rating || '5.0'}</span>
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-10 relative z-10">
                <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                    <h3 className="text-[var(--primary)] font-bold mb-4 text-lg">Información Personal</h3>

                    <div className="space-y-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-[var(--primary-light)]/10 rounded-full mr-4 text-[var(--primary-light)]">
                                <UserIcon size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Nombre Completo</p>
                                <p className="font-medium text-gray-800">{user.fullName}</p>
                            </div>
                        </div>

                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-[var(--primary-light)]/10 rounded-full mr-4 text-[var(--primary-light)]">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Email</p>
                                <p className="font-medium text-gray-800">{user.email}</p>
                            </div>
                        </div>

                        {/* Phone placeholder if not available in basic User type yet */}
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-[var(--primary-light)]/10 rounded-full mr-4 text-[var(--primary-light)]">
                                <Phone size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Teléfono</p>
                                <p className="font-medium text-gray-800">+51 987 654 321</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </MainLayout>
    );
}
