import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';

export default function LoanList() {
    const { user } = useAuth();
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            api.get(`/loans?userId=${user.id}`)
                .then(res => {
                    // Handle new response structure { borrowed, lent }
                    const allLoans = [...(res.data.borrowed || []), ...(res.data.lent || [])];
                    setLoans(allLoans);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-[var(--bg-light)]">
            <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
                <Link to="/" className="p-2 mr-2">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-lg font-bold">Mis Préstamos</h1>
            </div>

            <div className="p-4 space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500">Cargando...</p>
                ) : loans.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 mb-4">No tienes préstamos activos.</p>
                        <Link to="/loan/new" className="text-[var(--primary)] font-bold">Solicitar uno ahora</Link>
                    </div>
                ) : (
                    loans.map((loan) => (
                        <div key={loan.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${loan.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                        loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {loan.status === 'PENDING' ? 'Pendiente' :
                                            loan.status === 'APPROVED' ? 'Aprobado' :
                                                loan.status === 'ACTIVE' ? 'Activo' :
                                                    loan.status === 'AWAITING_CONFIRMATION' ? 'Por Confirmar' :
                                                        loan.status === 'COMPLETED' ? 'Pagado' :
                                                            loan.status === 'REJECTED' ? 'Rechazado' : loan.status}
                                    </span>
                                    <div className="text-xs text-gray-400 mt-1">Ref: {loan.id.slice(0, 8)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">S/. {loan.totalAmountDue}</div>
                                    <div className="text-xs text-gray-500">Monto adeudado</div>
                                </div>
                            </div>

                            <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>{loan.termMonths} sem.</span>
                                </div>
                                <div className="flex items-center">
                                    <FileText className="w-4 h-4 mr-1" />
                                    <Link to="/documents" className="text-[var(--primary)]">Ver docs</Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
