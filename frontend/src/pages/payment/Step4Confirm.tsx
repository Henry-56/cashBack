import React from 'react';
import { Check, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Step4Props {
    data: any;
    onSubmit: () => void;
    result: any;
}

export const Step4Confirm: React.FC<Step4Props> = ({ data, onSubmit, result }) => {
    if (result) {
        return (
            <div className="animate-enter flex flex-col items-center pt-12 pb-20 px-8">
                <div className="w-24 h-24 rounded-[2.5rem] bg-teal-500 flex items-center justify-center mb-8 shadow-2xl shadow-teal-500/30 animate-scale-in">
                    <Check className="text-white w-12 h-12" strokeWidth={4} />
                </div>

                <div className="text-center mb-12">
                    <h2 className="text-5xl font-black text-[var(--primary)] mb-4 tracking-tighter">
                        S/. {data.amount}
                    </h2>
                    <p className="text-teal-600 font-black uppercase tracking-[0.2em] text-xs mb-8">Pago en Proceso de Revisión</p>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-gray-50 flex flex-col gap-4 max-w-xs mx-auto">
                        <div className="flex items-center justify-between text-left">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Referencia</span>
                            <span className="text-sm font-black text-[var(--primary)]">#REV-{Math.floor(Math.random() * 90000) + 10000}</span>
                        </div>
                        <div className="flex items-center justify-between text-left border-t border-gray-50 pt-4">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Método</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                <span className="text-sm font-black text-[var(--primary)]">Transferencia</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-4">
                    <Link
                        to="/"
                        className="w-full bg-[var(--primary)] text-white font-black py-6 rounded-[2rem] shadow-premium hover:bg-gray-800 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                    >
                        Volver al Dashboard <ArrowRight size={20} />
                    </Link>

                    <div className="flex items-center justify-center gap-2 text-indigo-300 pt-6">
                        <ShieldCheck size={14} />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em]">Operación Protegida</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-enter space-y-8">
            <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner text-indigo-600">
                    <TrendingUp size={40} />
                </div>
                <h2 className="text-3xl font-black text-[var(--primary)] tracking-tight mb-2">Confirmar Envío</h2>
                <p className="text-[var(--text-muted)] font-medium">Verifica los detalles antes de finalizar.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-gray-50 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Monto a Reportar</p>
                <h3 className="text-4xl font-black text-[var(--primary)] tracking-tighter mb-8">S/. {data.amount}</h3>

                <button
                    onClick={onSubmit}
                    className="w-full bg-teal-500 text-white font-black py-6 rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-600 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                >
                    Confirmar Pago <Check size={20} />
                </button>
            </div>
        </div>
    );
};
