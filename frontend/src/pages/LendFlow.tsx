import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { ChevronLeft, UploadCloud, CheckCircle, AlertCircle, Loader2, ArrowRight, TrendingUp, ShieldCheck, Plus } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Tesseract from 'tesseract.js';
import { maskName } from '../utils/maskData';
import { ContractStep } from './steps/ContractStep';

export default function LendFlow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loan, setLoan] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lenderSignature, setLenderSignature] = useState<string>('');
    const [useSavedSignature, setUseSavedSignature] = useState(false);

    // OCR Validation State
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [validationMessage, setValidationMessage] = useState('');

    useEffect(() => {
        api.get(`/loans/${id}`).then(res => setLoan(res.data)).catch(err => console.error(err));
    }, [id]);

    const validateImage = async (fileToValidate: File) => {
        setIsValidating(true);
        setValidationStatus('idle');
        setValidationMessage('Analizando comprobante con IA...');

        try {
            const result = await Tesseract.recognize(
                fileToValidate,
                'eng+spa',
                { logger: m => console.log(m) }
            );

            const text = result.data.text.toLowerCase();
            const primaryKeywords = ['yape', 'plin', 'bcp', 'bbva', 'interbank', 'scotiabank'];
            const transactionKeywords = ['pagaste', 'enviaste', 'recibiste', 'transferencia', 'operación', 'operacion', 'soles', 's/.'];

            const foundPrimary = primaryKeywords.filter(keyword => text.includes(keyword));
            const foundTransaction = transactionKeywords.filter(keyword => text.includes(keyword));

            if (foundPrimary.length > 0 && foundTransaction.length > 0) {
                setValidationStatus('valid');
                setValidationMessage(`¡Comprobante válido detectado! (${foundPrimary[0]})`);
                toast.success("Comprobante validado");
            } else {
                setValidationStatus('invalid');
                setValidationMessage('No se detectó un comprobante claro. ¿Es una captura de Yape/Plin?');
            }
        } catch (error) {
            setValidationStatus('invalid');
            setValidationMessage('Error al analizar la imagen.');
        } finally {
            setIsValidating(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));
            validateImage(f);
        }
    };

    const handleFund = async () => {
        setIsLoading(true);
        try {
            const proofUrl = "https://placeholder.com/proof.jpg"; // Placeholder
            if (!user?.id) return;
            await api.post(`/loans/${id}/fund`, {
                lenderId: user.id,
                proofUrl,
                signatureBase64: useSavedSignature ? undefined : lenderSignature,
                useSavedSignature
            });

            // Update user state if a new signature was saved
            if (!useSavedSignature && lenderSignature && !user?.signatureUrl) {
                // We update with the local signature temporarily until next login/refresh
                // The backend already saved it to the DB during fundLoan via ensureUserSignature
                updateUser({ signatureUrl: lenderSignature });
            }

            setStep(4);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al procesar");
        } finally {
            setIsLoading(false);
        }
    };

    if (!loan) return <div className="p-8 text-center text-gray-400 font-bold">Cargando detalles...</div>;

    const profit = (parseFloat(loan.totalAmountDue) - parseFloat(loan.amountRequested)).toFixed(2);

    return (
        <MainLayout>
            <div className="animate-enter pb-24">
                {/* Header Context */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-4 bg-white rounded-2xl shadow-sm"><ChevronLeft size={24} /></button>
                    <div>
                        <h1 className="text-xl font-black text-[var(--primary)] tracking-tight">
                            {step === 1 ? 'Confirmar Financiamiento' : step === 2 ? 'Contrato Digital' : step === 3 ? 'Validar Comprobante' : '¡Financiado!'}
                        </h1>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Paso {step} de 4</p>
                    </div>
                </div>

                {step === 1 && (
                    <div className="space-y-8">
                        <div className="text-center mb-10">
                            <div className="mx-auto w-24 h-24 bg-[var(--accent)] rounded-[3rem] flex items-center justify-center mb-6 shadow-premium">
                                <TrendingUp size={48} className="text-[var(--primary)]" />
                            </div>
                            <h2 className="text-4xl font-black text-[var(--primary)] tracking-tighter mb-2">Vas a prestar S/.{loan.amountRequested}</h2>
                            <p className="text-[var(--text-muted)] font-medium">Estás a pocos pasos de generar dividendos.</p>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-gray-50 space-y-6">
                            <div className="flex justify-between items-center bg-teal-50/50 p-4 rounded-2xl">
                                <span className="text-[10px] font-black uppercase text-teal-900 tracking-widest">Tu Ganancia Neta</span>
                                <span className="text-2xl font-black text-teal-600 tracking-tighter">+ S/.{profit}</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Solicitante</span>
                                    <span className="font-black text-[var(--primary)]">{maskName(loan.borrowerName)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Plazo de Retorno</span>
                                    <span className="font-black text-[var(--primary)]">{loan.termMonths} Semanas</span>
                                </div>
                            </div>

                            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                <p className="text-xs font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                    <span className="text-lg">📱</span> Depositar a través de Yape/Plin:
                                </p>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-3xl font-black text-indigo-900 tracking-tighter">{loan.borrowerPhone || '--- --- ---'}</h3>
                                    <div className="flex gap-1">
                                        <div className="bg-purple-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase">Yape</div>
                                        <div className="bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase">Plin</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-[var(--primary)] text-white py-6 rounded-[2rem] font-black text-xl shadow-premium hover:bg-[var(--primary-light)] transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
                        >
                            Proceder a Firmar
                            <ArrowRight size={24} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <ContractStep
                        role="lender"
                        data={{
                            amount: parseFloat(loan.amountRequested),
                            termMonths: loan.termMonths,
                            borrowerName: loan.borrowerName,
                            borrowerDni: loan.borrowerDni
                        }}
                        onSign={(sig, isSaved) => {
                            setLenderSignature(sig);
                            setUseSavedSignature(!!isSaved);
                            setStep(3);
                        }}
                        onBack={() => setStep(1)}
                    />
                )}

                {step === 3 && (
                    <div className="space-y-8">
                        <div className="text-center mb-8">
                            <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                                <UploadCloud className="text-indigo-600 w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-[var(--primary)] tracking-tight mb-2">Validar Pago</h2>
                            <p className="text-[var(--text-muted)] font-medium">Sube una captura del depósito realizado.</p>
                        </div>

                        <div className={`w-full h-80 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center bg-white cursor-pointer transition-all relative overflow-hidden shadow-premium
                            ${validationStatus === 'valid' ? 'border-teal-500 bg-teal-50/30' : 'border-gray-100 hover:border-indigo-200'}
                            ${validationStatus === 'invalid' ? 'border-red-200 bg-red-50/30' : ''}
                        `}
                            onClick={() => !isValidating && document.getElementById('file-upload')?.click()}>

                            {preview ? (
                                <img src={preview} alt="Comprobante" className={`w-full h-full object-cover transition-opacity ${isValidating ? 'opacity-30' : 'opacity-100'}`} />
                            ) : (
                                <div className="text-center p-8">
                                    <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                        <Plus size={32} />
                                    </div>
                                    <span className="text-[var(--primary)] font-black uppercase tracking-widest text-xs">Seleccionar Archivo</span>
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Click para abrir la galería</p>
                                </div>
                            )}

                            {isValidating && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                                    <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                                    <span className="text-indigo-900 font-black uppercase tracking-widest text-[10px]">Analizando Captura...</span>
                                </div>
                            )}

                            <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isValidating} />
                        </div>

                        {validationStatus !== 'idle' && (
                            <div className={`p-6 rounded-[2rem] flex items-start gap-4 animate-enter ${validationStatus === 'valid' ? 'bg-teal-50 border border-teal-100 text-teal-800' : 'bg-red-50 border border-red-100 text-red-800'}`}>
                                <div className={`p-2 rounded-xl text-white ${validationStatus === 'valid' ? 'bg-teal-500' : 'bg-red-500'}`}>
                                    {validationStatus === 'valid' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-tight mb-1">{validationStatus === 'valid' ? '¡Validación Exitosa!' : 'Error de Validación'}</p>
                                    <p className="text-xs font-medium opacity-80">{validationMessage}</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleFund}
                            disabled={isLoading || isValidating || !file || validationStatus !== 'valid'}
                            className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-premium text-white transition-all uppercase tracking-widest
                                ${isLoading || isValidating || !file || validationStatus !== 'valid' ? 'bg-gray-200 cursor-not-allowed shadow-none' : 'bg-[var(--primary)] hover:bg-[var(--primary-light)] active:scale-95'}`}
                        >
                            {isLoading ? 'Procesando...' : 'Confirmar Financiamiento'}
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-8 animate-enter flex flex-col items-center pt-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
                            <div className="relative w-32 h-32 bg-teal-50 rounded-[3rem] flex items-center justify-center shadow-inner scale-in-center">
                                <ShieldCheck className="text-teal-500 w-16 h-16" strokeWidth={2.5} />
                            </div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-4xl font-black text-[var(--primary)] tracking-tighter mb-3">¡Préstamo Financiado!</h2>
                            <p className="text-[var(--text-muted)] font-medium px-4">Has completado el financiamiento con éxito. <br /> El dinero está en camino al beneficiario.</p>
                        </div>

                        <div className="w-full bg-white rounded-[2.5rem] p-8 shadow-premium border border-gray-50 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Monto Invertido</span>
                                <span className="font-black text-[var(--primary)]">S/. {loan.amountRequested}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Beneficiario</span>
                                <span className="font-black text-[var(--primary)]">{maskName(loan.borrowerName)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Estado</span>
                                <span className="font-black text-yellow-600">Verificando Confirmación</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-[var(--primary)] text-white py-6 rounded-[2rem] font-black text-xl shadow-premium hover:bg-[var(--primary-light)] flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95"
                        >
                            Volver al Dashboard
                            <ArrowRight size={24} />
                        </button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
