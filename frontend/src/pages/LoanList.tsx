import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, TrendingUp, CreditCard, ChevronRight, Search } from 'lucide-react';
import { MainLayout } from '../components/MainLayout';

export default function LoanList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'borrowed' | 'lent'>('all');

    useEffect(() => {
        if (user) {
            api.get(`/loans?userId=${user.id}`)
                .then(res => {
                    const borrowed = (res.data.borrowed || []).map((l: any) => ({ ...l, type: 'borrowed' }));
                    const lent = (res.data.lent || []).map((l: any) => ({ ...l, type: 'lent' }));
                    setLoans([...borrowed, ...lent]);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const filteredLoans = loans.filter(l => {
        if (activeTab === 'all') return true;
        return l.type === activeTab;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-teal-50 text-teal-600 border-teal-100';
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'ACTIVE': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'COMPLETED': return 'bg-gray-50 text-gray-400 border-gray-100';
            case 'REJECTED': return 'bg-red-50 text-red-500 border-red-100';
            default: return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    return (
        <MainLayout>
            <div className="animate-enter pb-24">
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-8 pt-4">
                    <button onClick={() => navigate(-1)} className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-[var(--primary)] tracking-tighter">Actividad</h1>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Historial de Transacciones</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-white p-2 rounded-[2rem] shadow-premium mb-8 border border-gray-50">
                    {(['all', 'borrowed', 'lent'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-gray-400'}`}
                        >
                            {tab === 'all' ? 'Ver Todo' : tab === 'borrowed' ? 'Solicitados' : 'Prestados'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cargando Historial...</p>
                        </div>
                    ) : filteredLoans.length === 0 ? (
                        <div className="text-center py-20 px-10 bg-white rounded-[2.5rem] shadow-premium border border-dashed border-gray-200">
                            <div className="bg-gray-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <Search className="text-gray-300 w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-[var(--primary)] mb-2 tracking-tight">Sin Movimientos</h3>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed mb-6">Aún no tienes actividad registrada en esta categoría.</p>
                            <Link to="/loan/new" className="text-[var(--primary)] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:gap-3 transition-all">
                                Empezar Ahora <ChevronRight size={14} />
                            </Link>
                        </div>
                    ) : (
                        filteredLoans.map((loan) => (
                            <div key={loan.id} className="group bg-white rounded-[2.5rem] p-6 shadow-premium border border-gray-50 hover:shadow-xl transition-all relative overflow-hidden active:scale-[0.98]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-2xl ${loan.type === 'borrowed' ? 'bg-red-50 text-red-500' : 'bg-teal-50 text-teal-600'}`}>
                                            {loan.type === 'borrowed' ? <CreditCard size={20} /> : <TrendingUp size={20} />}
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyles(loan.status)}`}>
                                                {loan.status}
                                            </span>
                                            <p className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-tight">Ref: #{loan.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-[var(--primary)] tracking-tighter">S/. {loan.amountRequested}</p>
                                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Total a {loan.type === 'borrowed' ? 'Pagar' : 'Recibir'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-300" />
                                        <span className="text-xs font-black text-[var(--primary)] uppercase tracking-tight">{loan.termMonths} Semanas</span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                        <FileText size={14} className="text-indigo-400" />
                                        <Link to="/documents" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-900 transition-colors">Digital Docs</Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
