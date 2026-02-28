import React, { useState } from 'react';
import { SignaturePad } from '../../components/SignaturePad';
import { useAuth } from '../../context/AuthContext';
import { Shield, FileText, Check, X, Edit3 } from 'lucide-react';

interface ContractStepProps {
    data: {
        amount: number;
        termMonths: number;
        borrowerName?: string;
        borrowerDni?: string;
    };
    role?: 'borrower' | 'lender';
    onSign: (signature: string, isSaved?: boolean) => void;
    onBack: () => void;
}

export const ContractStep: React.FC<ContractStepProps> = ({ data, onSign, onBack, role = 'borrower' }) => {
    const { user } = useAuth();
    const [accepted, setAccepted] = useState(false);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [signature, setSignature] = useState<string | null>(null);

    const RATES: Record<number, number> = { 1: 8, 2: 12, 3: 16, 4: 20 };
    const ratePercent = RATES[data.termMonths] || 20;
    const totalToPay = data.amount * (1 + ratePercent / 100);

    const handleSaveSignature = (sig: string) => {
        setSignature(sig);
        setShowSignaturePad(false);
    };

    return (
        <div className="space-y-8 animate-enter">
            <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                    <FileText className="text-amber-600 w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-[var(--primary)] tracking-tight mb-2">Firma Digital</h2>
                <p className="text-[var(--text-muted)] font-medium">Revisa los términos del contrato y firma abajo.</p>
            </div>

            {/* Contract Container */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-gray-100 overflow-hidden">
                <div className="p-8 h-80 overflow-y-auto bg-gray-50/50 text-sm leading-relaxed text-gray-600 custom-scrollbar">
                    <div className="flex items-center gap-2 mb-6 text-gray-400">
                        <Shield size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Acuerdo Legal Cashback v2.0</span>
                    </div>

                    <h3 className="font-black text-[var(--primary)] text-xl mb-6 uppercase tracking-tight text-center">
                        {role === 'borrower' ? 'PAGARÉ ELECTRÓNICO' : 'ACUERDO DE FINANCIAMIENTO'}
                    </h3>

                    <div className="space-y-4">
                        <p>
                            Yo, <span className="font-black text-gray-900">{user?.fullName?.toUpperCase()}</span>,
                            con N° de documento <span className="font-black text-gray-900">{user?.documentNumber || 'NO REGISTRADO'}</span>,
                            {role === 'borrower' ? 'declaro y acepto el compromiso de pago bajo las condiciones estipuladas.' : 'acepto financiar voluntariamente el préstamo solicitado.'}
                        </p>

                        {role === 'lender' && data.borrowerName && (
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-4">
                                <p className="text-xs font-bold text-indigo-900 mb-1">DESTINATARIO:</p>
                                <p className="font-black text-indigo-700">{data.borrowerName.toUpperCase()}</p>
                                <p className="text-[10px] opacity-70">DNI: {data.borrowerDni}</p>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="font-bold opacity-50">CAPITAL PRINCIPAL</span>
                                <span className="font-black text-[var(--primary)]">S/. {data.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold opacity-50">PLAZO TOTAL</span>
                                <span className="font-black text-[var(--primary)]">{data.termMonths} SEMANAS</span>
                            </div>
                            <div className="h-px bg-gray-50"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">TOTAL ESTIMADO</span>
                                <span className="text-xl font-black text-teal-600 tracking-tighter">S/. {totalToPay.toFixed(2)}</span>
                            </div>
                        </div>

                        <p className="text-xs italic opacity-80">
                            * Al firmar este documento, acepto que la información es vinculante y me someto a los términos de uso y privacidad de la plataforma Cashback.
                        </p>
                    </div>
                </div>

                {/* Accept Checkbox */}
                <div onClick={() => setAccepted(!accepted)} className={`p-6 flex items-center gap-4 cursor-pointer transition-colors ${accepted ? 'bg-indigo-50 border-t border-indigo-100' : 'bg-white border-t border-gray-50'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${accepted ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-100 text-gray-400'}`}>
                        {accepted && <Check size={18} strokeWidth={3} />}
                    </div>
                    <div>
                        <p className={`text-sm font-black tracking-tight ${accepted ? 'text-indigo-900' : 'text-gray-400'}`}>Acepto todos los términos</p>
                        <p className="text-[10px] text-gray-400 font-medium">He leído el contrato digital por completo</p>
                    </div>
                </div>
            </div>

            {/* Signature Area */}
            {!signature ? (
                <div className="space-y-4">
                    {user?.signatureUrl && (
                        <button
                            onClick={() => onSign(user.signatureUrl!, true)}
                            disabled={!accepted}
                            className={`w-full py-6 rounded-[2rem] font-black text-lg transition-all flex flex-col items-center justify-center gap-1 active:scale-95 shadow-premium border-2 border-teal-100 ${accepted
                                ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                                : 'bg-gray-50 text-gray-300 cursor-not-allowed border-none shadow-none'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Check size={24} />
                                USAR MI FIRMA REGISTRADA
                            </div>
                            <span className="text-[10px] uppercase tracking-widest opacity-60 font-black">Validada con Cloudflare R2</span>
                        </button>
                    )}

                    <button
                        onClick={() => setShowSignaturePad(true)}
                        disabled={!accepted}
                        className={`w-full py-6 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-95 shadow-premium ${accepted
                            ? 'bg-[var(--accent)] text-[var(--primary)] hover:bg-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border-none shadow-none'
                            }`}
                    >
                        <Edit3 size={24} />
                        {user?.signatureUrl ? 'Firmar Manualmente' : 'Capturar Firma'}
                    </button>
                </div>
            ) : (
                <div className="space-y-4 pt-2">
                    <div className="relative group bg-white rounded-[2.5rem] p-8 border-2 border-dashed border-teal-200 shadow-sm flex flex-col items-center justify-center min-h-[160px]">
                        <button
                            onClick={() => setSignature(null)}
                            className="absolute top-4 right-4 bg-red-50 text-red-500 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                        <img src={signature} alt="Firma" className="max-h-24 mix-blend-multiply transition-transform group-hover:scale-110" />
                        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 flex items-center gap-2">
                            <Check size={12} /> Firma Validada
                        </span>
                    </div>

                    <button
                        onClick={() => onSign(signature, false)}
                        className="w-full bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-black py-6 rounded-[2rem] text-xl shadow-premium transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
                    >
                        {role === 'borrower' ? 'Enviar Solicitud' : 'Financiar Ahora'}
                        <Check size={24} />
                    </button>
                </div>
            )}

            {/* Signature Pad Modal */}
            {showSignaturePad && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--primary)]/60 backdrop-blur-md">
                    <div className="bg-white rounded-[3rem] p-8 w-full max-w-md shadow-2xl relative scale-in-center">
                        <button
                            onClick={() => setShowSignaturePad(false)}
                            className="absolute top-8 right-8 text-gray-300 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-[var(--primary)] tracking-tight">Dibuja tu firma</h3>
                            <p className="text-sm text-gray-400 font-medium">Usa tu dedo o mouse dentro del recuadro.</p>
                        </div>

                        <div className="bg-gray-50 rounded-[2rem] p-2 border-2 border-gray-100">
                            <SignaturePad onSave={handleSaveSignature} />
                        </div>

                        <div className="mt-8 flex items-center gap-3 text-gray-400 bg-gray-50 p-4 rounded-2xl">
                            <Shield size={16} className="shrink-0" />
                            <p className="text-[10px] font-medium leading-relaxed italic">
                                Tu firma será encriptada y vinculada únicamente a este contrato digital con validez jurídica.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-2">
                <button onClick={onBack} className="w-full text-gray-400 font-black text-xs uppercase tracking-widest py-2 hover:text-gray-600 transition-all">
                    Regresar al paso anterior
                </button>
            </div>
        </div>
    );
};
