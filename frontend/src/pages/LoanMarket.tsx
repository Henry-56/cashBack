import { useEffect, useState } from 'react';
import { MainLayout } from '../components/MainLayout';
import { ArrowLeft, SlidersHorizontal, Star, TrendingUp, ShieldCheck, Search, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { maskName } from '../utils/maskData';

interface Loan {
    id: string;
    amountRequested: string;
    termMonths: number;
    description?: string;
    createdAt: string;
    userId: string;
    user: {
        fullName: string;
        rating: string;
    }
}

export default function LoanMarket() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'recent' | 'amount_desc' | 'amount_asc'>('recent');

    useEffect(() => {
        const endpoint = user ? `/loans/market?userId=${user.id}` : '/loans/market';
        api.get(endpoint)
            .then(res => {
                setLoans(res.data);
                setFilteredLoans(res.data);
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
            <div className="animate-enter pb-24">
                {/* Header Context */}
                <div className="flex flex-col gap-6 mb-8 pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-3xl font-black text-[var(--primary)] tracking-tighter">Inversiones</h1>
                        </div>
                        <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                            <TrendingUp size={20} />
                        </div>
                    </div>

                    {/* Search & Stats Bar */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-4 rounded-3xl shadow-premium border border-gray-50 flex items-center gap-3">
                            <div className="bg-teal-50 p-2 rounded-xl text-teal-600"><Star size={16} fill="currentColor" /></div>
                            <div>
                                <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Oportunidades</p>
                                <p className="text-sm font-black text-[var(--primary)]">{loans.length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-3xl shadow-premium border border-gray-50 flex items-center gap-3">
                            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><ShieldCheck size={16} /></div>
                            <div>
                                <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Garantía</p>
                                <p className="text-sm font-black text-[var(--primary)] text-green-600 tracking-tighter">Activa</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Area */}
                <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        onClick={() => setFilterType('recent')}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${filterType === 'recent' ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg' : 'bg-white text-gray-400 border-gray-50'}`}
                    >
                        Más Recientes
                    </button>
                    <button
                        onClick={() => setFilterType('amount_desc')}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${filterType === 'amount_desc' ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg' : 'bg-white text-gray-400 border-gray-50'}`}
                    >
                        Mayor Retorno
                    </button>
                    <button
                        onClick={() => setFilterType('amount_asc')}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${filterType === 'amount_asc' ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg' : 'bg-white text-gray-400 border-gray-50'}`}
                    >
                        Menor Riesgo
                    </button>
                    <button className="p-3 bg-white rounded-2xl text-gray-400 border-2 border-gray-50 shrink-0">
                        <Filter size={16} />
                    </button>
                </div>

                {/* Market Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronizando Mercado...</p>
                    </div>
                ) : filteredLoans.length === 0 ? (
                    <div className="text-center py-20 px-10 bg-white rounded-[2.5rem] shadow-premium border border-dashed border-gray-200">
                        <div className="bg-gray-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <Search className="text-gray-300 w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-[var(--primary)] mb-2 tracking-tight">Sin Oportunidades</h3>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">No hay solicitudes disponibles ahora mismo. Vuelve pronto para nuevas inversiones.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredLoans.map((loan) => (
                            <Link
                                key={loan.id}
                                to={`/lend/${loan.id}`}
                                className="group block bg-white rounded-[2.5rem] p-8 shadow-premium border border-gray-50 hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden active:scale-[0.98]"
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors opacity-50"></div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monto Solicitado</p>
                                            <h4 className="text-3xl font-black text-[var(--primary)] tracking-tighter">S/.{loan.amountRequested}</h4>
                                        </div>
                                        <div className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                            <Star size={10} fill="currentColor" /> {loan.user?.rating || '5.0'}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md">
                                                {loan.user?.fullName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Solicitante</p>
                                                <p className="text-sm font-black text-[var(--primary)]">{maskName(loan.user?.fullName || 'Usuario')}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1 bg-gray-50 p-3 rounded-2xl">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Plazo</p>
                                                <p className="text-xs font-black text-[var(--primary)]">{loan.termMonths} Semanas</p>
                                            </div>
                                            <div className="flex-1 bg-gray-50 p-3 rounded-2xl">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Retorno</p>
                                                <p className="text-xs font-black text-teal-600">Premium</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                            Invertir Ahora <ArrowRight size={14} />
                                        </span>
                                        <div className="w-10 h-10 bg-[var(--accent)] rounded-full flex items-center justify-center text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TrendingUp size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
