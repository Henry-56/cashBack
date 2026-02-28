import React from 'react';
import { Clock, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActiveLoanCard: React.FC<{ loan: any, onConfirm?: (id: string) => void, onReject?: (id: string) => void }> = ({ loan, onConfirm, onReject }) => {
    const isAwaiting = loan.status === 'AWAITING_CONFIRMATION';
    const progress = loan.paymentProgress;
    const progressPercent = progress ? (progress.paidInstallments / progress.totalInstallments) * 100 : 0;

    return (
        <div className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl group ${isAwaiting
            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100'
            : 'bg-[var(--primary)] text-white shadow-xl'
            }`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>

            <div className="relative z-10 flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${isAwaiting ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white/20 text-white'
                            }`}>
                            {isAwaiting ? 'Confirma tu Pago' : 'Préstamo Activo'}
                        </span>
                    </div>

                    <h3 className={`text-3xl font-black tracking-tight ${isAwaiting ? 'text-[var(--primary)]' : 'text-white'}`}>
                        S/. {progress?.remaining || loan.totalAmountDue}
                    </h3>
                    <p className={`text-sm mt-1 font-medium ${isAwaiting ? 'text-gray-500' : 'text-white/60'}`}>
                        de un total de S/. {loan.totalAmountDue}
                    </p>

                    {progress && !isAwaiting && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between text-xs mb-2 font-bold uppercase tracking-wider text-white/80">
                                <span>Progreso de Pago</span>
                                <span>{progress.paidInstallments}/{progress.totalInstallments} cuotas</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            {progress.pendingConfirmations > 0 && (
                                <div className="mt-3 flex items-center space-x-2 text-yellow-300">
                                    <Clock size={14} className="animate-spin-slow" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">
                                        {progress.pendingConfirmations} pago(s) en verificación
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="ml-4 flex flex-col items-end">
                    {isAwaiting ? (
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={() => onConfirm && onConfirm(loan.id)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95"
                            >
                                Confirmar
                            </button>
                            <button
                                onClick={() => onReject && onReject(loan.id)}
                                className="bg-white/80 hover:bg-white text-red-500 px-5 py-2.5 rounded-2xl font-bold text-sm border-none transition-all active:scale-95"
                            >
                                No Recibí
                            </button>
                        </div>
                    ) : (
                        (!progress || (progress.completedPayments + progress.pendingConfirmations) < progress.totalInstallments) ? (
                            <Link to={`/pay/${loan.id}`} className="bg-[var(--accent)] hover:bg-white text-[var(--primary)] p-4 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95">
                                <TrendingUp size={24} />
                            </Link>
                        ) : (
                            <div className="bg-white/10 p-3 rounded-2xl">
                                <Clock className="text-white/40" size={24} />
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export const MarketLoanCard: React.FC<{ loan: any, onLend: (id: string) => void }> = ({ loan, onLend }) => (
    <div className="glass-effect rounded-[2rem] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:translate-x-1 hover:shadow-premium border-none relative group overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--primary-light)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-[var(--primary)] font-black text-3xl tracking-tight">S/.{loan.amountRequested}</h4>
                <div className="bg-teal-50 text-[var(--primary-light)] px-3 py-1 rounded-full text-[10px] font-bold">
                    {loan.termMonths} semanas
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {loan.user?.fullName?.charAt(0)}
                </div>
                <p className="text-sm font-bold text-gray-700">Solicitante Verificado</p>
                <div className="flex text-yellow-400">
                    {'★'.repeat(Math.round(Number(loan.user?.rating || 1)))}
                </div>
            </div>
        </div>

        <button
            onClick={() => onLend(loan.id)}
            className="w-full sm:w-auto bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
            <span>Prestar</span>
            <ArrowUpRight size={18} />
        </button>
    </div>
);
