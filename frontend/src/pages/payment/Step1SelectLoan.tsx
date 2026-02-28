import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Calendar, ChevronRight, Search, Loader2 } from 'lucide-react';

interface Step1Props {
    onSelect: (loanId: string) => void;
}

export const Step1SelectLoan: React.FC<Step1Props> = ({ onSelect }) => {
    const { user } = useAuth();
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                if (!user) return;
                const res = await api.get(`/loans?userId=${user.id}`);
                // Only active/approved loans that user borrowed
                const borrowed = res.data.borrowed || [];
                setLoans(borrowed.filter((l: any) => l.status !== 'COMPLETED'));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchLoans();
    }, [user]);

    return (
        <div className="space-y-8 animate-enter">
            <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner text-indigo-600">
                    <CreditCard size={40} />
                </div>
                <h2 className="text-3xl font-black text-[var(--primary)] tracking-tight mb-2">Pagar Préstamo</h2>
                <p className="text-[var(--text-muted)] font-medium">Selecciona la obligación que deseas cancelar hoy.</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Buscando obligaciones...</p>
                </div>
            ) : loans.length === 0 ? (
                <div className="text-center py-20 px-10 bg-white rounded-[2.5rem] shadow-premium border border-dashed border-gray-200">
                    <div className="bg-gray-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <Search className="text-gray-300 w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--primary)] mb-2 tracking-tight">Todo al día</h3>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">No tienes préstamos pendientes de pago actualmente.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] px-2 mb-2">Tus Deudas Activas</h3>
                    {loans.map((loan) => (
                        <button
                            key={loan.id}
                            onClick={() => onSelect(loan.id)}
                            className="group w-full bg-white p-6 rounded-[2.5rem] shadow-premium border border-gray-50 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-5 text-left active:scale-[0.98]"
                        >
                            <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <CreditCard size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-sm font-black text-[var(--primary)] tracking-tight">Préstamo #{loan.id.slice(0, 6)}</h4>
                                    <span className="text-xl font-black text-[var(--primary)] tracking-tighter">S/. {loan.totalAmountDue}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={10} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{loan.termMonths} Semanas</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Próximo Vencimiento</span>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-200 group-hover:text-indigo-600 transition-colors" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
