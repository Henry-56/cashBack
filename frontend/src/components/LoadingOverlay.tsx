import React from 'react';
import { useLoading } from '../context/LoadingContext';
import { Loader2 } from 'lucide-react';

export const LoadingOverlay: React.FC = () => {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative">
                {/* Outer Glow Effect */}
                <div className="absolute inset-0 bg-[var(--accent)] blur-2xl opacity-20 animate-pulse"></div>

                {/* Loading Card */}
                <div className="relative bg-white/80 p-10 rounded-[3rem] shadow-premium flex flex-col items-center gap-6 border border-white/50">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-[var(--primary)] animate-spin stroke-[3]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-ping"></div>
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl font-black text-[var(--primary)] tracking-tight uppercase">Procesando</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Conectando con el servidor</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
