import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../components/MainLayout';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Bell, Clock, AlertCircle, Plus, Wallet, ArrowRight, TrendingUp } from 'lucide-react';
import api from '../api/client';
import socket from '../api/socket';
import { toast } from 'react-hot-toast';
import logo from '../assets/logo.png';
import { maskName } from '../utils/maskData';
import { extractFirstName } from '../utils/nameUtils';
import { ActiveLoanCard, MarketLoanCard } from '../components/DashboardCards';

interface Loan {
    id: string;
    amountRequested: string;
    totalAmountDue: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'AWAITING_CONFIRMATION';
    termMonths: number;
    createdAt: string;
    user?: {
        fullName: string;
        rating: string;
    };
    borrowerSignature?: string;
    paymentProgress?: {
        totalPaid: string;
        remaining: string;
        paidInstallments: number;
        totalInstallments: number;
        pendingConfirmations: number;
        completedPayments: number;
    };
}

const LoanOfferCard = ({ amount }: { amount: string }) => (
    <Link
        to={`/loan/new?amount=${amount}`}
        className="bg-white rounded-3xl min-w-[160px] sm:min-w-[200px] p-1 shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-premium transition-all active:scale-95"
    >
        <div className="pl-5 py-6">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Solicitar</span>
            <h3 className="text-[var(--primary)] font-black text-2xl tracking-tighter">S/.{amount}</h3>
        </div>
        <div className="bg-[#7EBEBF] w-12 h-20 rounded-2xl flex items-center justify-center mr-1 group-hover:bg-[var(--primary-light)] transition-colors">
            <Plus className="text-[var(--primary)] group-hover:text-white transition-colors" size={24} />
        </div>
    </Link>
);

export default function Dashboard() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [rejectedPaymentModal, setRejectedPaymentModal] = useState<{ show: boolean, amount: string, message: string }>({ show: false, amount: '', message: '' });

    // 1. Unified Dashboard Data Query
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard', user?.id],
        queryFn: async () => {
            if (!user) return null;
            const [userLoansRes, marketLoansRes, pendingPaymentsRes] = await Promise.all([
                api.get(`/loans?userId=${user.id}`),
                api.get(`/loans/market?userId=${user.id}`),
                api.get(`/loans/payments/pending?lenderId=${user.id}`)
            ]);
            return {
                borrowed: userLoansRes.data.borrowed as Loan[],
                lent: userLoansRes.data.lent as Loan[],
                market: marketLoansRes.data as Loan[],
                pendingPayments: pendingPaymentsRes.data as any[]
            };
        },
        enabled: !!user
    });

    const borrowedLoans = dashboardData?.borrowed || [];
    const lentLoans = dashboardData?.lent || [];
    const marketLoans = dashboardData?.market || [];
    const pendingPayments = dashboardData?.pendingPayments || [];

    // Auto-sync signatureUrl logic
    useEffect(() => {
        if (borrowedLoans.length > 0 && user && !user.signatureUrl) {
            const loansWithSignature = borrowedLoans.filter((l: any) => l.borrowerSignature);
            if (loansWithSignature.length > 0) {
                updateUser({ signatureUrl: loansWithSignature[0].borrowerSignature });
            }
        }
    }, [borrowedLoans, user, updateUser]);

    // Socket notifications are now handled centrally in App.tsx

    const activeDebts = borrowedLoans.filter(l => l.status === 'ACTIVE' || l.status === 'APPROVED' || l.status === 'AWAITING_CONFIRMATION');
    const pendingDebts = borrowedLoans.filter(l => l.status === 'PENDING');
    const activeInvestments = lentLoans.filter(l => l.status === 'ACTIVE' || l.status === 'APPROVED');
    const pendingInvestments = lentLoans.filter(l => l.status === 'AWAITING_CONFIRMATION');

    const [rejectingLoanId, setRejectingLoanId] = useState<string | null>(null);

    // 2. Optimistic Mutation for Confirming Money Received
    const confirmMutation = useMutation({
        mutationFn: (loanId: string) => api.post(`/loans/${loanId}/confirm`, {}, { skipLoader: true } as any),
        onMutate: async (loanId) => {
            await queryClient.cancelQueries({ queryKey: ['dashboard', user?.id] });
            const previousData = queryClient.getQueryData(['dashboard', user?.id]);

            queryClient.setQueryData(['dashboard', user?.id], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    borrowed: old.borrowed.map((l: any) => l.id === loanId ? { ...l, status: 'ACTIVE' } : l)
                };
            });

            return { previousData };
        },
        onError: (_err, _loanId, context) => {
            queryClient.setQueryData(['dashboard', user?.id], context?.previousData);
            toast.error("Error al confirmar recepción.");
        },
        onSuccess: () => {
            toast.success("¡Dinero recibido!");
            queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
        }
    });

    const handleConfirm = (loanId: string) => confirmMutation.mutate(loanId);

    // 3. Socket-based Cache Invalidation
    useEffect(() => {
        if (!user) return;

        const handleUpdate = () => {
            console.log('Socket event received: invalidating dashboard cache');
            queryClient.invalidateQueries({ queryKey: ['dashboard', user.id] });
        };

        // Listen to all relevant events that trigger data changes
        socket.on('new_loan_request', handleUpdate);
        socket.on('loan_funded', handleUpdate);
        socket.on('payment_received', handleUpdate);
        socket.on('loan_active', handleUpdate);
        socket.on('payment_rejected', handleUpdate);
        socket.on('loan_completed', handleUpdate);

        return () => {
            socket.off('new_loan_request', handleUpdate);
            socket.off('loan_funded', handleUpdate);
            socket.off('payment_received', handleUpdate);
            socket.off('loan_active', handleUpdate);
            socket.off('payment_rejected', handleUpdate);
            socket.off('loan_completed', handleUpdate);
        };
    }, [user, queryClient]);

    // 4. Mutation for Rejecting a Loan (Borrower)
    const rejectLoanMutation = useMutation({
        mutationFn: (loanId: string) => api.post(`/loans/${loanId}/reject`),
        onSuccess: () => {
            toast.success("Préstamo rechazado.");
            queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
            setRejectingLoanId(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Error al rechazar.");
        }
    });

    const confirmReject = () => {
        if (rejectingLoanId) rejectLoanMutation.mutate(rejectingLoanId);
    };

    // 5. Mutations for Payment Verification (Lender)
    const confirmPaymentMutation = useMutation({
        mutationFn: (paymentId: string) => api.post(`/loans/payments/${paymentId}/confirm`, {}, { skipLoader: true } as any),
        onMutate: async (paymentId) => {
            await queryClient.cancelQueries({ queryKey: ['dashboard', user?.id] });
            const previousData = queryClient.getQueryData(['dashboard', user?.id]);

            queryClient.setQueryData(['dashboard', user?.id], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pendingPayments: old.pendingPayments.filter((p: any) => p.id !== paymentId)
                };
            });

            return { previousData };
        },
        onSuccess: (res) => {
            toast.success("¡Pago confirmado!");
            queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
            if (res.data.loanCompleted) toast.success("🎉 ¡Préstamo pagado!");
        },
        onError: (error: any, _paymentId, context) => {
            queryClient.setQueryData(['dashboard', user?.id], context?.previousData);
            toast.error(error.response?.data?.error || "Error al confirmar");
        }
    });

    const rejectPaymentMutation = useMutation({
        mutationFn: (paymentId: string) => api.post(`/loans/payments/${paymentId}/reject`, {}, { skipLoader: true } as any),
        onSuccess: () => {
            toast.error("Pago rechazado.");
            queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Error al rechazar");
        }
    });

    const handleConfirmPayment = (paymentId: string) => confirmPaymentMutation.mutate(paymentId);
    const handleRejectPayment = (paymentId: string) => rejectPaymentMutation.mutate(paymentId);

    return (
        <MainLayout>
            <div className="space-y-8 animate-enter">
                {/* Hero / Wallet Section - Mobile Header */}
                <div className="lg:hidden -mt-6 -mx-6 bg-[var(--primary)] pt-10 pb-8 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <img src={logo} alt="Logo" className="h-10 w-auto brightness-0 invert" />
                        <div className="flex space-x-3">
                            <button className="p-2 bg-white/10 rounded-xl text-white backdrop-blur-md"><Bell size={20} /></button>
                            <button className="p-2 bg-white/10 rounded-xl text-white backdrop-blur-md"><Settings size={20} /></button>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/20 relative z-10">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-14 h-14 bg-[var(--accent)] rounded-2xl flex items-center justify-center text-[var(--primary)] font-black text-2xl shadow-inner">
                                {extractFirstName(user?.fullName).charAt(0)}
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Bienvenido,</p>
                                <h2 className="text-white text-xl font-black tracking-tight">{extractFirstName(user?.fullName)}</h2>
                            </div>
                        </div>

                        <div className="bg-white/10 rounded-3xl p-5 border border-white/10">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Balance Actual</p>
                                    <h3 className="text-white text-3xl font-black tracking-tighter">S/. 0.00</h3>
                                </div>
                                <div className="bg-white/20 p-3 rounded-2xl text-white"><Wallet size={24} /></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Welcome */}
                <div className="hidden lg:block">
                    <h1 className="text-responsive-h1 text-[var(--primary)] mb-2">Hola, {extractFirstName(user?.fullName)} 👋</h1>
                    <p className="text-[var(--text-muted)] font-medium">Aquí tienes un resumen de tus finanzas para hoy.</p>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column - Main Actions & Market */}
                    <div className="space-y-8 lg:col-span-8">

                        {/* Solicitar Section */}
                        <section>
                            <div className="flex justify-between items-end mb-4">
                                <h3 className="text-xl font-black text-[var(--primary)] tracking-tight">Solicitud Rápida</h3>
                                <Link to="/loan/new" className="text-xs font-bold text-[var(--primary-light)] hover:underline flex items-center gap-1">
                                    Ver todas <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                                <LoanOfferCard amount="100.00" />
                                <LoanOfferCard amount="200.00" />
                                <LoanOfferCard amount="500.00" />
                            </div>
                        </section>

                        {/* Marketplace Section */}
                        <section>
                            <div className="flex justify-between items-end mb-4">
                                <h3 className="text-xl font-black text-[var(--primary)] tracking-tight">Oportunidades de Inversión</h3>
                                <Link to="/market" className="text-xs font-bold text-[var(--primary-light)] hover:underline flex items-center gap-1">
                                    Explorar Mercado <ArrowRight size={14} />
                                </Link>
                            </div>
                            {marketLoans.length === 0 ? (
                                <div className="bg-white rounded-[2rem] p-10 text-center border-2 border-dashed border-gray-100">
                                    <p className="text-gray-400 font-medium">Buscando nuevas oportunidades...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                    {marketLoans.slice(0, 3).map((loan) => (
                                        <MarketLoanCard key={loan.id} loan={loan} onLend={(id) => navigate(`/lend/${id}`)} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Pagos Pendientes - Lender View */}
                        {pendingPayments.length > 0 && (
                            <section className="bg-indigo-50/50 rounded-[2.5rem] p-6 lg:p-8 border border-indigo-100">
                                <h3 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-2">
                                    <div className="bg-indigo-600 p-2 rounded-lg text-white"><Clock size={16} /></div>
                                    Confirmar Pagos Recibidos
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pendingPayments.map(payment => (
                                        <div key={payment.id} className="bg-white rounded-3xl p-5 shadow-sm border border-indigo-100 flex flex-col justify-between">
                                            <div>
                                                <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-3 animate-pulse">💰 Verificación Requerida</p>
                                                <h4 className="text-2xl font-black text-[var(--primary)]">S/. {payment.amountPaid}</h4>
                                                <p className="text-sm text-gray-500 font-bold mt-1">{maskName(payment.borrowerName)}</p>
                                            </div>
                                            <div className="flex gap-2 mt-6">
                                                <button onClick={() => handleConfirmPayment(payment.id)} className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold text-xs shadow-md shadow-indigo-100 active:scale-95 transition-all">SÍ, RECIBIDO</button>
                                                <button onClick={() => handleRejectPayment(payment.id)} className="px-4 py-3 bg-gray-50 text-gray-400 rounded-2xl font-bold text-xs hover:bg-red-50 hover:text-red-500 transition-all">NO</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column - Status & History */}
                    <div className="space-y-8 lg:col-span-4">

                        {/* Active Debts */}
                        <section>
                            <h3 className="text-xl font-black text-[var(--primary)] mb-4 tracking-tight">Mis Préstamos</h3>
                            {activeDebts.length === 0 && pendingDebts.length === 0 ? (
                                <div className="bg-white rounded-[2rem] p-8 text-center border-2 border-dashed border-gray-100">
                                    <AlertCircle className="mx-auto text-gray-200 mb-2" size={32} />
                                    <p className="text-gray-400 text-sm font-medium">No tienes deudas activas.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeDebts.map(loan => (
                                        <ActiveLoanCard key={loan.id} loan={loan} onConfirm={handleConfirm} onReject={(id) => setRejectingLoanId(id)} />
                                    ))}
                                    {pendingDebts.map(loan => (
                                        <div key={loan.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex justify-between items-center group hover:border-[var(--accent)] transition-all">
                                            <div>
                                                <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1">En Revisión</p>
                                                <h4 className="text-xl font-black text-[var(--primary)]">S/. {loan.amountRequested}</h4>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-2xl text-gray-300 group-hover:text-[var(--accent)] transition-colors"><Clock size={20} /></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Investments */}
                        {(activeInvestments.length > 0 || pendingInvestments.length > 0) && (
                            <section>
                                <h3 className="text-xl font-black text-[var(--primary)] mb-4 tracking-tight">Mis Inversiones</h3>
                                <div className="space-y-4">
                                    {pendingInvestments.map(loan => (
                                        <div key={loan.id} className="bg-orange-50/50 rounded-3xl p-5 border border-orange-100 flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Esperando Firma</p>
                                                <h4 className="text-xl font-black text-[var(--primary)]">S/. {loan.amountRequested}</h4>
                                            </div>
                                            <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><Clock size={20} /></div>
                                        </div>
                                    ))}
                                    {activeInvestments.map(loan => (
                                        <div key={loan.id} className="bg-teal-50/50 rounded-3xl p-5 border border-teal-100 flex justify-between items-center group hover:bg-teal-50 transition-all">
                                            <div>
                                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Generando Rendimiento</p>
                                                <h4 className="text-xl font-black text-[var(--primary)]">S/. {loan.amountRequested}</h4>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1">Retorno: S/. {loan.totalAmountDue}</p>
                                            </div>
                                            <div className="bg-teal-600 p-3 rounded-2xl text-white shadow-lg shadow-teal-100"><TrendingUp size={20} /></div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                </div>
            </div>

            {/* Modals */}
            {rejectingLoanId && (
                <div className="fixed inset-0 bg-[var(--primary)]/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl scale-in-center">
                        <div className="text-center">
                            <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={40} className="text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">¿Seguro que deseas rechazar?</h3>
                            <p className="text-gray-500 font-medium text-sm mb-8 px-2">Esta acción es irreversible y se notificará al prestamista que el dinero no llegó.</p>
                            <div className="flex flex-col space-y-3">
                                <button onClick={confirmReject} className="bg-red-500 text-white font-black py-4 rounded-2xl hover:bg-red-600 shadow-lg shadow-red-100 transition-all active:scale-95">SÍ, RECHAZAR PRÉSTAMO</button>
                                <button onClick={() => setRejectingLoanId(null)} className="text-gray-400 font-black py-2 hover:text-gray-600 transition-all">CANCELAR</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {rejectedPaymentModal.show && (
                <div className="fixed inset-0 bg-[var(--primary)]/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl scale-in-center border-b-8 border-red-500">
                        <div className="text-center">
                            <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🚫</div>
                            <h3 className="text-2xl font-black text-red-600 mb-2 tracking-tight">¡Pago No Verificado!</h3>
                            <p className="text-gray-500 font-medium text-sm mb-6">El prestamista indica que NO recibió el pago de:</p>
                            <div className="bg-gray-50 rounded-2xl py-4 mb-8">
                                <span className="text-4xl font-black text-gray-900 tracking-tighter">S/. {rejectedPaymentModal.amount}</span>
                            </div>
                            <button onClick={() => setRejectedPaymentModal({ show: false, amount: '', message: '' })} className="w-full bg-[var(--primary)] text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all">ENTENDIDO</button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
