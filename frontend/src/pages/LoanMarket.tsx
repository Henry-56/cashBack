import { useEffect, useState } from 'react';
import { MainLayout } from '../components/MainLayout';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Loan {
    id: string;
    amountRequested: string;
    termMonths: number;
    description?: string;
    createdAt: string;
    userId: string;
}

export default function LoanMarket() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'recent' | 'amount_desc' | 'amount_asc'>('recent');

    useEffect(() => {
        api.get('/loans/market')
            .then(res => {
                // Filter out own loans if any
                const othersLoans = res.data.filter((l: Loan) => l.userId !== user?.id);
                setLoans(othersLoans);
                setFilteredLoans(othersLoans);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [user]);

    useEffect(() => {
        let sorted = [...loans];
        if (filterType === 'recent') {
            sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (filterType === 'amount_desc') {
            sorted.sort((a, b) => parseFloat(b.amountRequested) - parseFloat(a.amountRequested));
        } else if (filterType === 'amount_asc') {
            sorted.sort((a, b) => parseFloat(a.amountRequested) - parseFloat(b.amountRequested));
        }
        setFilteredLoans(sorted);
    }, [filterType, loans]);

    return (
        <MainLayout>
            <div className="bg-[var(--primary)] pt-8 pb-6 px-6 rounded-b-[2rem] shadow-lg mb-6">
                <div className="flex items-center space-x-4 text-white mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">Mercado de Préstamos</h1>
                </div>

                {/* Filters */}
                <div className="bg-white/10 p-2 rounded-xl flex space-x-2 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setFilterType('recent')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filterType === 'recent' ? 'bg-[var(--accent)] text-[var(--primary)]' : 'text-white hover:bg-white/10'}`}
                    >
                        Más Recientes
                    </button>
                    <button
                        onClick={() => setFilterType('amount_desc')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filterType === 'amount_desc' ? 'bg-[var(--accent)] text-[var(--primary)]' : 'text-white hover:bg-white/10'}`}
                    >
                        Mayor Monto
                    </button>
                    <button
                        onClick={() => setFilterType('amount_asc')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filterType === 'amount_asc' ? 'bg-[var(--accent)] text-[var(--primary)]' : 'text-white hover:bg-white/10'}`}
                    >
                        Menor Monto
                    </button>
                </div>
            </div>

            <div className="px-6 pb-20 space-y-4">
                <div className="flex justify-between items-center text-gray-500">
                    <p className="text-sm">{filteredLoans.length} solicitudes encontradas</p>
                    <SlidersHorizontal size={16} />
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">Cargando ofertas...</div>
                ) : filteredLoans.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-2xl">
                        No hay ofertas disponibles con estos filtros.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredLoans.map((loan) => (
                            <div key={loan.id} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 flex flex-col hover:shadow-xl transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-[var(--primary)] font-bold text-3xl">S/.{loan.amountRequested}</h4>
                                        <p className="text-xs text-gray-400 mt-1">Solicitado el {new Date(loan.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-bold">
                                        {loan.termMonths} Semanas
                                    </span>
                                </div>

                                <Link
                                    to={`/lend/${loan.id}`}
                                    className="w-full bg-[var(--primary)] text-white py-3 rounded-xl font-bold text-center hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>Prestar ahora</span>
                                    <span className="text-[var(--accent)]">➔</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
