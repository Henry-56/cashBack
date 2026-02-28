import React from 'react';
import { CheckCircle2, ArrowRight, Home, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Step3Props {
    loan: any;
}

export const Step3Success: React.FC<Step3Props> = ({ loan }) => {
    return (
        <div className="animate-enter flex flex-col items-center pt-8 space-y-8">
            {/* Celebrate Icon */}
            <div className="relative">
                <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative w-32 h-32 bg-teal-50 rounded-[3rem] flex items-center justify-center shadow-inner scale-in-center">
                    <CheckCircle2 className="text-teal-500 w-16 h-16" strokeWidth={2.5} />
                </div>
            </div>

            <div className="text-center">
                <h2 className="text-4xl font-black text-[var(--primary)] tracking-tighter mb-3">
                    ¡Solicitud Enviada!
                </h2>
                <p className="text-[var(--text-muted)] font-medium px-4">
                    Tu solicitud ya está en el mercado. <br /> Te notificaremos cuando alguien la financie.
                </p>
            </div>

            {/* Success Summary */}
            <div className="w-full bg-white rounded-[2.5rem] p-8 shadow-premium border border-gray-50 space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl text-teal-600 shadow-sm"><CreditCard size={16} /></div>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Monto</span>
                        </div>
                        <span className="text-xl font-black text-[var(--primary)] tracking-tighter">S/. {loan.amountRequested}</span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl text-indigo-600 shadow-sm"><div className="w-4 h-4 flex items-center justify-center text-[10px] font-black">24</div></div>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Espera Estimada</span>
                        </div>
                        <span className="text-sm font-black text-[var(--primary)] tracking-tight">Menos de 24h</span>
                    </div>
                </div>

                <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl flex gap-3 items-start">
                    <div className="bg-teal-500 p-1.5 rounded-lg text-white shrink-0 mt-0.5"><CheckCircle2 size={12} /></div>
                    <p className="text-[10px] text-teal-900 font-bold leading-relaxed">
                        Tu contrato ha sido generado y firmado digitalmente. Puedes descargarlo en cualquier momento desde el detalle de tu préstamo.
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-4 pt-4">
                <Link
                    to="/"
                    className="flex items-center justify-center gap-3 w-full bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-black py-6 rounded-[2rem] text-xl shadow-premium transition-all transform hover:-translate-y-1 active:scale-95"
                >
                    Ir al Inicio
                    <ArrowRight size={24} />
                </Link>

                <Link
                    to="/market"
                    className="flex items-center justify-center gap-2 w-full text-gray-400 font-black py-2 hover:text-[var(--primary)] transition-all uppercase tracking-widest text-xs"
                >
                    <Home size={16} />
                    Explorar el Mercado
                </Link>
            </div>
        </div>
    );
};
