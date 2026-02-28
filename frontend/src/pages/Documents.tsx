import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, ShieldCheck, Search, Clock, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MainLayout } from '../components/MainLayout';
import { toast } from 'react-hot-toast';

export default function Documents() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data: loansData, isLoading } = useQuery({
        queryKey: ['my-loans', user?.id],
        queryFn: async () => {
            if (!user?.id) return { borrowed: [], lent: [] };
            const response = await api.get(`/loans?userId=${user.id}`);
            return response.data;
        },
        enabled: !!user?.id
    });

    const handleDownload = (loanId: string, isStatic: boolean = false, staticUrl?: string) => {
        if (isStatic && (!staticUrl || staticUrl === '#')) {
            toast.success("Documento de ejemplo: Los contratos reales se generan automáticamente al firmar.");
            return;
        }

        if (isStatic && staticUrl) {
            window.open(staticUrl, '_blank');
            return;
        }

        // Use our new secure backend download endpoint
        const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001/api'}/loans/${loanId}/download-contract`;

        // More robust download trigger
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.target = '_blank';
        link.download = `contrato_${loanId.slice(0, 8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Extract all contracts from both borrowed and lent loans
    const contractDocuments = [
        ...(loansData?.borrowed || []),
        ...(loansData?.lent || [])
    ].filter(loan => !!loan.contractUrl)
        .map(loan => ({
            id: loan.id,
            name: `Contrato de Préstamo #${loan.id.slice(0, 5).toUpperCase()}`,
            date: loan.createdAt ? format(new Date(loan.createdAt), 'dd MMM yyyy', { locale: es }) : 'N/A',
            size: '1.2 MB', // Hardcoded as we don't store file size yet
            url: loan.contractUrl,
            isStatic: false
        }));

    // Static common documents
    const staticDocs = [
        { id: 't-c', name: 'Términos y Condiciones v4.0', date: '15 Ene 2024', size: '0.8 MB', url: '#', isStatic: true },
        { id: 'p-p', name: 'Acuerdo de Privacidad', date: '10 Ene 2024', size: '0.5 MB', url: '#', isStatic: true },
    ];

    const allDocuments = [...contractDocuments, ...staticDocs];

    return (
        <MainLayout>
            <div className="animate-enter pb-24">
                {/* Header Context */}
                <div className="flex flex-col gap-6 mb-8 pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow text-[var(--primary)]">
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-3xl font-black text-[var(--primary)] tracking-tighter">Bóveda Digital</h1>
                        </div>
                        <div className="bg-teal-50 p-2 rounded-xl text-teal-600">
                            <ShieldCheck size={20} />
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 font-medium px-1">Tus contratos legalmente vinculados y documentos oficiales protegidos con criptografía.</p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <div className="absolute inset-y-0 left-5 flex items-center text-gray-300">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar documentos..."
                        className="w-full bg-white border-2 border-transparent py-4 pl-12 pr-6 rounded-[2rem] shadow-premium focus:border-indigo-100 transition-all outline-none font-medium text-sm text-[var(--primary)]"
                    />
                </div>

                {/* Document List */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] px-2 mb-2">Recientes</h3>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2.5rem] shadow-premium">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Sincronizando Bóveda...</p>
                        </div>
                    ) : allDocuments.length > 0 ? (
                        allDocuments.map((doc) => (
                            <div key={doc.id} className="group bg-white rounded-[2.5rem] p-6 shadow-premium border border-gray-50 hover:shadow-xl transition-all flex items-center gap-4 active:scale-[0.98]">
                                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-[var(--primary)] tracking-tight mb-1">{doc.name}</h4>
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Clock size={10} />
                                            <span className="text-[10px] font-medium">{doc.date}</span>
                                        </div>
                                        <span className="text-[10px]">•</span>
                                        <span className="text-[10px] uppercase font-black tracking-widest">{doc.size}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDownload(doc.id, doc.isStatic, doc.url)}
                                    className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                                >
                                    <Download size={20} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-12 bg-white rounded-[2.5rem] shadow-premium">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No hay documentos firmados aún</p>
                        </div>
                    )}
                </div>

                {/* Security Badge */}
                <div className="mt-12 p-8 bg-indigo-900 rounded-[3rem] text-white overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="text-teal-400" size={24} />
                            <h3 className="text-lg font-black tracking-tight">Seguridad Certificada</h3>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed font-medium mb-6">
                            Todos tus documentos están firmados electrónicamente bajo la ley de firmas y certificados digitales.
                        </p>
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Ver certificados legales</span>
                            <ChevronRight size={14} className="text-teal-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
