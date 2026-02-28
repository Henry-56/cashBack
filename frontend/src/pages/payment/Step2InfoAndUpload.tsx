import React, { useState } from 'react';
import { UploadCloud, Clock, AlertCircle, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import { toast } from 'react-hot-toast';
import { maskName } from '../../utils/maskData';

interface Step2Props {
    loan: any;
    onNext: () => void;
    setFile: (file: File) => void;
}

export const Step2InfoAndUpload: React.FC<Step2Props> = ({ loan, onNext, setFile }) => {
    const navigate = useNavigate();
    const [preview, setPreview] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [validationMessage, setValidationMessage] = useState('');

    const installmentAmount = loan ? (parseFloat(loan.totalAmountDue) / parseFloat(loan.termMonths)).toFixed(2) : "0.00";

    const validateImage = async (file: File) => {
        setIsValidating(true);
        setValidationStatus('idle');
        setValidationMessage('Analizando comprobante con IA...');

        try {
            const result = await Tesseract.recognize(file, 'eng+spa');
            const text = result.data.text.toLowerCase();
            const primaryKeywords = ['yape', 'plin', 'bcp', 'bbva', 'interbank', 'scotiabank'];
            const transactionKeywords = ['pagaste', 'enviaste', 'recibiste', 'transferencia', 'operación', 'operacion', 'soles', 's/.'];

            const foundPrimary = primaryKeywords.filter(keyword => text.includes(keyword));
            const foundTransaction = transactionKeywords.filter(keyword => text.includes(keyword));

            if (foundPrimary.length > 0 && foundTransaction.length > 0) {
                setValidationStatus('valid');
                setValidationMessage(`¡Comprobante válido detectado! (${foundPrimary[0]})`);
                toast.success("Pago validado");
            } else {
                setValidationStatus('invalid');
                setValidationMessage('No se detectó un comprobante claro. Intenta con otra captura.');
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

    if (!loan) return <div className="p-8 text-center text-gray-400 font-bold">Cargando detalles...</div>;

    return (
        <div className="space-y-8 animate-enter">
            <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-teal-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner text-teal-600">
                    <Clock size={40} />
                </div>
                <h2 className="text-3xl font-black text-[var(--primary)] tracking-tight mb-2">Validar Pago</h2>
                <p className="text-[var(--text-muted)] font-medium">Sube la captura de tu transferencia de cuota.</p>
            </div>

            {/* Premium Info Card */}
            <div className="bg-[var(--primary)] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-2">Cuota a Pagar</p>
                    <h3 className="text-5xl font-black tracking-tighter mb-6">S/. {installmentAmount}</h3>
                    <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/5">
                        <div className="text-left">
                            <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Plazo</p>
                            <p className="text-xs font-black">{loan.termMonths} Semanas</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Deuda Total</p>
                            <p className="text-xs font-black">S/. {loan.totalAmountDue}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instruction / Lender Info */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-gray-50 space-y-6">
                <div className="flex items-start gap-4">
                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 shrink-0"><ShieldCheck size={24} /></div>
                    <div>
                        <h4 className="text-sm font-black text-[var(--primary)] uppercase tracking-tight">Depositar a:</h4>
                        <p className="text-2xl font-black text-indigo-900 tracking-tighter mt-1">{loan.lenderPhone || '--- --- ---'}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{maskName(loan.lenderName || 'Prestamista')}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <span className="bg-purple-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Yape</span>
                    <span className="bg-green-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Plin</span>
                </div>
            </div>

            {/* Block if pending confirmations */}
            {loan.paymentProgress?.pendingConfirmations > 0 && (
                <div className="p-8 bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] text-center mb-4">
                    <div className="bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600">
                        <Clock size={32} />
                    </div>
                    <h4 className="font-black text-amber-900 text-lg mb-2 tracking-tight">Pagos en Verificación</h4>
                    <p className="text-amber-700 text-xs font-medium leading-relaxed">
                        Tienes <strong>{loan.paymentProgress.pendingConfirmations} pago(s)</strong> pendientes. Espera a que el prestamista los confirme para realizar uno nuevo.
                    </p>
                </div>
            )}

            {(!loan.paymentProgress || loan.paymentProgress.pendingConfirmations === 0) && (
                <div className="space-y-6">
                    {/* Upload Box */}
                    <div
                        className={`w-full h-80 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center bg-white cursor-pointer transition-all relative overflow-hidden shadow-premium
                            ${validationStatus === 'valid' ? 'border-teal-500 bg-teal-50/30' : 'border-gray-100 hover:border-indigo-200'}
                            ${validationStatus === 'invalid' ? 'border-red-200 bg-red-50/30' : ''}
                        `}
                        onClick={() => !isValidating && document.getElementById('payment-proof-upload')?.click()}
                    >
                        {preview ? (
                            <img src={preview} alt="Comprobante" className={`w-full h-full object-cover transition-opacity ${isValidating ? 'opacity-30' : 'opacity-100'}`} />
                        ) : (
                            <div className="text-center p-8">
                                <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-inner">
                                    <UploadCloud size={32} />
                                </div>
                                <span className="text-[var(--primary)] font-black uppercase tracking-widest text-xs">Captura del Pago</span>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">Click para abrir la galería</p>
                            </div>
                        )}

                        {isValidating && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                                <span className="text-indigo-900 font-black uppercase tracking-widest text-[10px]">Verificando Transacción...</span>
                            </div>
                        )}

                        <input id="payment-proof-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isValidating} />
                    </div>

                    {/* Validation Feedback */}
                    {validationStatus !== 'idle' && (
                        <div className={`p-6 rounded-[2rem] flex items-start gap-4 animate-enter ${validationStatus === 'valid' ? 'bg-teal-50 border border-teal-100 text-teal-800' : 'bg-red-50 border border-red-100 text-red-800'}`}>
                            <div className={`p-2 rounded-xl text-white ${validationStatus === 'valid' ? 'bg-teal-500' : 'bg-red-500'}`}>
                                {validationStatus === 'valid' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-tight mb-1">{validationStatus === 'valid' ? '¡Pago Detectado!' : 'Error de Lectura'}</p>
                                <p className="text-xs font-medium opacity-80">{validationMessage}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onNext}
                        disabled={!preview || isValidating || validationStatus !== 'valid'}
                        className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-premium text-white transition-all uppercase tracking-widest active:scale-95
                            ${!preview || isValidating || validationStatus !== 'valid' ? 'bg-gray-200 cursor-not-allowed shadow-none' : 'bg-[var(--primary)] hover:bg-[var(--primary-light)]'}`}
                    >
                        {isValidating ? 'Procesando...' : 'Confirmar Pago'}
                    </button>
                </div>
            )}

            <button onClick={() => navigate(-1)} className="w-full text-gray-400 font-black text-xs uppercase tracking-widest py-4 hover:text-gray-600 transition-all">
                Cancelar Operación
            </button>
        </div>
    );
};
