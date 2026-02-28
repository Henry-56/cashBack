import React from 'react';
import { ShieldCheck, Info, Calendar, ArrowRight, TrendingUp } from 'lucide-react';

interface Step2Props {
    data: {
        amount: number;
        termMonths: number;
    };
    onSubmit: () => void;
}

const RATES: Record<number, number> = { 1: 8, 2: 12, 3: 16, 4: 20 };

export const Step2Review: React.FC<Step2Props> = ({ data, onSubmit }) => {
    const ratePercent = RATES[data.termMonths] || 20;
    const interestAmount = data.amount * (ratePercent / 100);
    const totalAmount = data.amount + interestAmount;

    // Mock date calculation
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (data.termMonths * 7));

    return (
        <div className="space-y-8 animate-enter">
            <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                    <ShieldCheck className="text-indigo-600 w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-[var(--primary)] tracking-tight mb-2">Revisa tu solicitud</h2>
                <p className="text-[var(--text-muted)] font-medium">Confirma los detalles antes de firmar el contrato.</p>
            </div>

            <div className="space-y-4">
                {/* Details Grid */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-gray-50 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monto Solicitado</p>
                            <h4 className="text-3xl font-black text-[var(--primary)] tracking-tighter">S/. {data.amount.toFixed(2)}</h4>
                        </div>
                        <div className="bg-teal-50 text-teal-600 p-3 rounded-2xl">
                            <Info size={20} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar size={14} className="text-indigo-600" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plazo</p>
                            </div>
                            <p className="text-sm font-black text-[var(--primary)] uppercase">{data.termMonths} Semanas</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp size={14} className="text-teal-600" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tasa</p>
                            </div>
                            <p className="text-sm font-black text-[var(--primary)] uppercase">{ratePercent}% Total</p>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-gray-500">Capital</span>
                            <span className="text-[var(--primary)] font-bold">S/. {data.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-gray-500">Intereses</span>
                            <span className="text-teal-600 font-bold">S/. {interestAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-base font-black text-[var(--primary)] uppercase tracking-widest">Total a pagar</span>
                            <span className="text-2xl font-black text-[var(--primary)] tracking-tighter">S/. {totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100 flex gap-4 items-start">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white shrink-0">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tight mb-1">Protección Garantizada</h4>
                        <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                            Al continuar, generarás un contrato digital legalmente vinculado bajo la legislación vigente de firmas electrónicas.
                        </p>
                    </div>
                </div>

                {/* Final Action */}
                <button
                    onClick={onSubmit}
                    className="w-full bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-black py-6 rounded-[2rem] text-xl shadow-premium transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest mt-4"
                >
                    Ir a Firmar Contrato
                    <ArrowRight size={24} />
                </button>
            </div>
        </div>
    );
};
