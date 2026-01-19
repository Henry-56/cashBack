import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../components/MainLayout';
import { Link } from 'react-router-dom';
import { Settings, Bell, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../api/client';
import { toast } from 'react-hot-toast';
import logo from '../assets/logo.png';
import { maskName } from '../utils/maskData';

interface Loan {
    id: string;
    amountRequested: string;
    totalAmountDue: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'AWAITING_CONFIRMATION';
    termMonths: number; // Actually weeks based on new logic
    createdAt: string;
    user?: {
        fullName: string;
        rating: string;
    };
    paymentProgress?: {
        totalPaid: string;
        remaining: string;
        paidInstallments: number;
        totalInstallments: number;
        pendingConfirmations: number;
        completedPayments: number;
    };
}

// Loan Offer Card Component
const LoanOfferCard = ({ amount }: { amount: string }) => (
    <div className="bg-white rounded-2xl min-w-[200px] shadow-sm flex justify-between items-stretch border border-gray-100 overflow-hidden">
        <div className="p-6 flex items-center">
            <h3 className="text-[var(--primary)] font-bold text-2xl">S/.{amount}</h3>
        </div>
        <div className="bg-[#7EBEBF] w-12 h-20 rounded-lg flex items-center justify-center mr-2 my-auto">
            <span className="transform -rotate-90 text-[var(--primary)] text-xs font-bold tracking-widest uppercase whitespace-nowrap">Enviar</span>
        </div>
    </div>
);

const ActiveLoanCard = ({ loan, onConfirm, onReject }: { loan: Loan, onConfirm?: (id: string) => void, onReject?: (id: string) => void }) => {
    // Mock next date for now since backend doesn't return payment schedule yet
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7);
    const dateStr = nextDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

    const isAwaiting = loan.status === 'AWAITING_CONFIRMATION';
    const progress = loan.paymentProgress;
    const progressPercent = progress ? (progress.paidInstallments / progress.totalInstallments) * 100 : 0;

    return (
        <div className={`rounded-2xl p-5 shadow-lg relative overflow-hidden mb-4 ${isAwaiting ? 'bg-gradient-to-r from-purple-50 to-green-50 border border-purple-200' : 'bg-[var(--primary)]'} ${isAwaiting ? 'text-gray-800' : 'text-white'}`}>
            {isAwaiting && (
                <p className="text-xs text-purple-600 font-bold mb-2 animate-pulse">
                    💰 PAGO RECIBIDO - CONFIRMAR
                </p>
            )}
            <div className="flex justify-between items-start z-10 relative">
                <div>
                    {!isAwaiting && (
                        <span className="bg-white/20 text-xs px-2 py-1 rounded text-white">
                            Préstamo Activo
                        </span>
                    )}
                    <h3 className={`text-2xl font-bold mt-1 ${isAwaiting ? 'text-[var(--primary)]' : 'text-white'}`}>S/. {progress?.remaining || loan.totalAmountDue}</h3>
                    <p className={`text-xs ${isAwaiting ? 'text-gray-500' : 'opacity-80'}`}>de S/. {loan.totalAmountDue}</p>

                    {/* Payment Progress */}
                    {progress && !isAwaiting && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span>Cuotas pagadas</span>
                                <span className="font-bold">{progress.paidInstallments}/{progress.totalInstallments}</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <div
                                    className="bg-green-400 h-2 rounded-full transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            {progress.pendingConfirmations > 0 && (
                                <p className="text-xs mt-2 text-yellow-200 animate-pulse">
                                    ⏳ {progress.pendingConfirmations} pago(s) pendiente(s) de confirmación
                                </p>
                            )}
                        </div>
                    )}

                    {!isAwaiting && !progress && <p className="text-xs text-gray-300 mt-2">Próximo pago: <span className="text-white font-bold">{dateStr}</span></p>}
                </div>

                {isAwaiting ? (
                    <div className="flex flex-col space-y-2">
                        <button
                            onClick={() => onConfirm && onConfirm(loan.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all transform hover:scale-105"
                        >
                            ✓ Confirmar
                        </button>
                        <button
                            onClick={() => onReject && onReject(loan.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all transform hover:scale-105"
                        >
                            ✗ No Verificar
                        </button>
                    </div>
                ) : (
                    // Only show Pay button if there are still installments to pay
                    // (completedPayments + pendingConfirmations) < totalInstallments
                    (!progress || (progress.completedPayments + progress.pendingConfirmations) < progress.totalInstallments) ? (
                        <Link to={`/pay/${loan.id}`} className="bg-[var(--accent)] text-[var(--primary)] px-3 py-1 rounded font-bold text-sm">
                            Pagar
                        </Link>
                    ) : (
                        <span className="bg-yellow-500/80 text-white px-3 py-1 rounded font-bold text-xs">
                            ⏳ Esperando
                        </span>
                    )
                )}
            </div>
        </div>
    );
};

const RequestedLoanCard = ({ loan }: { loan: Loan }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center mb-3">
        <div>
            <div className="flex items-center space-x-2 mb-1">
                <span className="font-bold text-[var(--primary)]">S/. {loan.amountRequested}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {loan.status === 'PENDING' ? 'EN REVISIÓN' : loan.status}
                </span>
            </div>
            <p className="text-xs text-gray-400">Solicitado el {new Date(loan.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-gray-300">
            {loan.status === 'PENDING' ? <Clock size={20} /> : <CheckCircle size={20} />}
        </div>
    </div>
);

export default function Dashboard() {
    const { user } = useAuth();
    const [borrowedLoans, setBorrowedLoans] = useState<Loan[]>([]);
    const [lentLoans, setLentLoans] = useState<Loan[]>([]);
    const [marketLoans, setMarketLoans] = useState<Loan[]>([]);
    const [pendingPayments, setPendingPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectedPaymentModal, setRejectedPaymentModal] = useState<{ show: boolean, amount: string, message: string }>({ show: false, amount: '', message: '' });

    useEffect(() => {
        if (user) {
            setLoading(true);
            Promise.all([
                api.get(`/loans?userId=${user.id}`), // Returns { borrowed: [], lent: [] }
                api.get(`/loans/market?userId=${user.id}`),
                api.get(`/loans/payments/pending?lenderId=${user.id}`)
            ]).then(([userLoansRes, marketLoansRes, pendingPaymentsRes]) => {
                // Handle new structure
                if (userLoansRes.data.borrowed) {
                    setBorrowedLoans(userLoansRes.data.borrowed);
                    setLentLoans(userLoansRes.data.lent);
                } else {
                    // Fallback for old API if backend didn't update hot
                    setBorrowedLoans(userLoansRes.data);
                }

                if (marketLoansRes.data) {
                    setMarketLoans(marketLoansRes.data);
                }

                if (pendingPaymentsRes.data) {
                    setPendingPayments(pendingPaymentsRes.data);
                }
            }).catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    // Socket Listener copied from duplicate check logic
    useEffect(() => {
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001');
        socket.on('new_loan_request', (data: any) => {
            if (user && data.userId === user.id) return;

            setMarketLoans(prev => {
                if (prev.find(l => l.amountRequested === data.amount)) return prev;
                return [{
                    id: data.id, // Use real ID from backend
                    amountRequested: data.amount,
                    totalAmountDue: '0.00',
                    status: 'PENDING',
                    termMonths: 1,
                    createdAt: new Date().toISOString()
                } as Loan, ...prev];
            });
        });

        // Listen for rejected payments
        socket.on('payment_rejected', (data: any) => {
            if (user && data.targetUserId === user.id) {
                setRejectedPaymentModal({
                    show: true,
                    amount: data.amount,
                    message: data.message
                });
                toast.error(`⚠️ Tu pago de S/. ${data.amount} fue rechazado`);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const activeDebts = borrowedLoans.filter(l => l.status === 'ACTIVE' || l.status === 'APPROVED' || l.status === 'AWAITING_CONFIRMATION');
    const pendingDebts = borrowedLoans.filter(l => l.status === 'PENDING');

    const activeInvestments = lentLoans.filter(l => l.status === 'ACTIVE' || l.status === 'APPROVED');
    const pendingInvestments = lentLoans.filter(l => l.status === 'AWAITING_CONFIRMATION');

    const [rejectingLoanId, setRejectingLoanId] = useState<string | null>(null);

    const handleConfirm = async (loanId: string) => {
        try {
            await api.post(`/loans/${loanId}/confirm`);
            toast.success("¡Dinero recibido! El préstamo está activo.");
            setBorrowedLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: 'ACTIVE' } as Loan : l));
        } catch (error) {
            console.error(error);
            toast.error("Hubo un problema al confirmar el préstamo.");
        }
    };

    const confirmReject = async () => {
        if (!rejectingLoanId) return;
        try {
            await api.post(`/loans/${rejectingLoanId}/reject`);
            toast.success("Has rechazado el préstamo. Se ha notificado al prestamista.");
            setBorrowedLoans(prev => prev.filter(l => l.id !== rejectingLoanId));
            setRejectingLoanId(null);
        } catch (error) {
            console.error(error);
            toast.error("No se pudo rechazar el préstamo. Inténtalo de nuevo.");
        }
    };

    const handleConfirmPayment = async (paymentId: string) => {
        try {
            const res = await api.post(`/loans/payments/${paymentId}/confirm`);
            toast.success("¡Pago confirmado!");

            // Remove from pending payments list
            setPendingPayments(prev => prev.filter(p => p.id !== paymentId));

            // If loan was completed, show special message
            if (res.data.loanCompleted) {
                toast.success("🎉 ¡El préstamo ha sido pagado completamente!", { duration: 5000 });
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al confirmar el pago");
        }
    };

    const handleRejectPayment = async (paymentId: string) => {
        try {
            await api.post(`/loans/payments/${paymentId}/reject`);
            toast.error("Pago rechazado. Se notificará al prestatario.");

            // Remove from pending payments list
            setPendingPayments(prev => prev.filter(p => p.id !== paymentId));
        } catch (error) {
            console.error(error);
            toast.error("Error al rechazar el pago");
        }
    };

    return (
        <MainLayout>
            {/* Header */}
            <div className="bg-[var(--primary)] pt-8 pb-6 px-6 rounded-b-[2rem] shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <img src={logo} alt="CashBack Logo" className="h-12 w-auto" />
                    </div>
                    <div className="flex space-x-4 text-white/80">
                        <Settings size={20} />
                        <Bell size={20} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 flex items-center space-x-4">
                    <div className="bg-[var(--accent)] w-12 h-12 rounded-full flex items-center justify-center text-[var(--primary)] font-bold text-xl">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold text-[var(--primary)]">{user?.fullName || 'Usuario'}</h2>
                        <div className="flex text-yellow-500 text-xs">
                            {'★★★★★'}
                        </div>
                    </div>
                    <Settings className="text-gray-300" size={18} />
                </div>
            </div>

            <div className="p-6 space-y-4">
                {/* Solicitar Préstamo Section */}
                <section>
                    <h3 className="font-bold text-[var(--primary)] mb-4">Solicitar préstamo</h3>
                    <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                        <Link to="/loan/new?amount=100">
                            <LoanOfferCard amount="100.00" />
                        </Link>
                        <Link to="/loan/new?amount=200">
                            <LoanOfferCard amount="200.00" />
                        </Link>
                        <Link to="/loan/new?amount=500">
                            <LoanOfferCard amount="500.00" />
                        </Link>
                    </div>
                </section>

                {/* Ofertas para prestar (Marketplace) */}
                <section>
                    <h3 className="font-bold text-[var(--primary)] mb-4">Ofertas para prestar</h3>
                    {marketLoans.length === 0 ? (
                        <div className="bg-gray-100 rounded-2xl p-6 text-center">
                            <p className="text-gray-400 text-sm">No hay solicitudes disponibles por el momento.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {marketLoans.slice(0, 3).map((loan) => (
                                <div key={loan.id} className="bg-gray-200 rounded-2xl p-6 flex justify-between items-center transform transition-all hover:scale-[1.02]">
                                    <div>
                                        <h4 className="text-[var(--primary)] font-bold text-2xl">S/.{loan.amountRequested}</h4>
                                        <p className="text-sm font-bold text-gray-700">{loan.user?.fullName || 'Usuario'}</p>
                                        <div className="flex items-center text-yellow-500 text-xs">
                                            {'★'.repeat(Math.round(Number(loan.user?.rating || 0)))}
                                            <span className="text-gray-300">{'★'.repeat(5 - Math.round(Number(loan.user?.rating || 0)))}</span>
                                            <span className="ml-1 text-gray-400">({loan.user?.rating || '0.0'})</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 font-medium">Plazo: {loan.termMonths} semanas</p>
                                    </div>
                                    <button
                                        onClick={() => window.location.href = `/lend/${loan.id}`}
                                        className="bg-[#8B8B5D] w-12 h-20 rounded-lg flex items-center justify-center cursor-pointer shadow-sm hover:bg-[#7A7A4E] border-none"
                                    >
                                        <span className="transform -rotate-90 text-white text-xs font-bold uppercase tracking-wider">Prestar</span>
                                    </button>
                                </div>
                            ))}
                            {marketLoans.length > 3 && (
                                <div className="text-center pt-2">
                                    <Link to="/market" className="text-[var(--primary)] font-bold text-sm hover:underline">
                                        Ver todas las ofertas ({marketLoans.length})
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Préstamos Activos (Deudas) */}
                {activeDebts.length > 0 && (
                    <section>
                        <h3 className="font-bold text-[var(--primary)] mb-4">Mis Deudas Activas</h3>
                        {activeDebts.map(loan => (
                            <ActiveLoanCard
                                key={loan.id}
                                loan={loan}
                                onConfirm={handleConfirm}
                                onReject={(id) => setRejectingLoanId(id)}
                            />
                        ))}
                    </section>
                )}

                {/* Solicitudes Pendientes (Deudas) */}
                {pendingDebts.length > 0 && (
                    <section>
                        <h3 className="font-bold text-[var(--primary)] mb-4">Solicitudes Pendientes</h3>
                        <div className="space-y-3">
                            {pendingDebts.map(loan => (
                                <RequestedLoanCard key={loan.id} loan={loan} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Inversiones Pendientes de Confirmación */}
                {pendingInvestments.length > 0 && (
                    <section>
                        <h3 className="font-bold text-orange-500 mb-4">Esperando Confirmación del Solicitante</h3>
                        {pendingInvestments.map(loan => (
                            <div key={loan.id} className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex justify-between items-center mb-3">
                                <div>
                                    <p className="text-xs text-orange-600 font-bold mb-1">CONFIRMACIÓN PENDIENTE</p>
                                    <h3 className="font-bold text-[var(--primary)] text-xl">S/. {loan.amountRequested}</h3>
                                    <p className="text-xs text-gray-500 mt-1">El solicitante debe confirmar la recepción</p>
                                </div>
                                <div className="text-right">
                                    <Clock size={20} className="text-orange-400 ml-auto" />
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Inversiones Activas (Solo confirmadas) */}
                {activeInvestments.length > 0 && (
                    <section>
                        <h3 className="font-bold text-[var(--primary)] mb-4">Mis Inversiones (Confirmadas)</h3>
                        {activeInvestments.map(loan => (
                            <div key={loan.id} className="bg-green-50 rounded-xl p-4 border border-green-100 flex justify-between items-center mb-3">
                                <div>
                                    <p className="text-xs text-green-600 font-bold mb-1">INVERSIÓN ACTIVA</p>
                                    <h3 className="font-bold text-[var(--primary)] text-xl">S/. {loan.amountRequested}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Retorno</p>
                                    <p className="font-bold text-green-600">S/. {loan.totalAmountDue}</p>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Pagos Pendientes de Confirmar (Para Prestamistas) */}
                {pendingPayments.length > 0 && (
                    <section>
                        <h3 className="font-bold text-purple-600 mb-4 flex items-center gap-2">
                            <span className="text-lg font-bold">S/.</span>
                            Pagos Pendientes de Confirmar
                        </h3>
                        {pendingPayments.map(payment => (
                            <div key={payment.id} className="bg-gradient-to-r from-purple-50 to-green-50 rounded-xl p-4 border border-purple-200 mb-3 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-purple-600 font-bold mb-1 animate-pulse">
                                            💰 PAGO RECIBIDO - CONFIRMAR
                                        </p>
                                        <h3 className="font-bold text-[var(--primary)] text-xl">S/. {payment.amountPaid}</h3>
                                        <p className="text-sm text-gray-600 mt-1">De: <span className="font-medium">{maskName(payment.borrowerName)}</span></p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleConfirmPayment(payment.id)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all transform hover:scale-105"
                                        >
                                            ✓ Confirmar
                                        </button>
                                        <button
                                            onClick={() => handleRejectPayment(payment.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all transform hover:scale-105"
                                        >
                                            ✗ No Verificar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Fallback if no loans */}
                {activeDebts.length === 0 && pendingDebts.length === 0 && activeInvestments.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p>No tienes préstamos activos ni solicitudes pendientes.</p>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {rejectingLoanId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
                        <div className="text-center">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Rechazar préstamo?</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Estás indicando que <strong>NO recibiste el dinero</strong>. Esta acción cancelará la solicitud y notificará al prestamista.
                            </p>
                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={confirmReject}
                                    className="bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors"
                                >
                                    Sí, rechazar préstamo
                                </button>
                                <button
                                    onClick={() => setRejectingLoanId(null)}
                                    className="text-gray-500 font-bold py-2 hover:text-gray-700"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Rejected Modal */}
            {rejectedPaymentModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
                        <div className="text-center">
                            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">❌</span>
                            </div>
                            <h3 className="text-xl font-bold text-red-600 mb-2">¡Pago Rechazado!</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                El prestamista indica que <strong>NO recibió</strong> tu pago de:
                            </p>
                            <p className="text-3xl font-bold text-red-500 mb-4">
                                S/. {rejectedPaymentModal.amount}
                            </p>
                            <p className="text-gray-500 text-xs mb-6">
                                Por favor verifica que enviaste el dinero al número correcto y vuelve a subir el comprobante.
                            </p>
                            <button
                                onClick={() => setRejectedPaymentModal({ show: false, amount: '', message: '' })}
                                className="w-full bg-[var(--primary)] text-white font-bold py-3 rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
