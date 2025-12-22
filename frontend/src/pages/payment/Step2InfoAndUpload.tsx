
import React, { useState } from 'react';
import { ArrowLeft, UploadCloud, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Step2Props {
    loan: any;
    onNext: () => void;
    setFile: (file: File) => void;
}

export const Step2InfoAndUpload: React.FC<Step2Props> = ({ loan, onNext, setFile }) => {
    const navigate = useNavigate();
    const [preview, setPreview] = useState<string | null>(null);

    // Calculate installment
    const installmentAmount = loan ? (parseFloat(loan.totalAmountDue) / parseFloat(loan.termMonths)).toFixed(2) : "0.00";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    if (!loan) return <div>Cargando información del préstamo...</div>;

    return (
        <div className="min-h-screen bg-white p-6 flex flex-col items-center animate-fade-in">
            <div className="w-full flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4">
                    <ArrowLeft className="text-[var(--primary)]" />
                </button>
                <h1 className="text-[var(--primary)] font-bold text-xl">Pagar cuota</h1>
            </div>

            {/* Info Card */}
            <div className="w-full bg-[var(--primary)] text-white rounded-2xl p-6 mb-8 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Clock size={100} />
                </div>
                <p className="text-sm opacity-80 mb-1">Monto de cuota</p>
                <h2 className="text-4xl font-bold mb-4">S/. {installmentAmount}</h2>
                <div className="flex justify-between text-xs border-t border-white/20 pt-3 opacity-90">
                    <span>Plazo total: {loan.termMonths} semanas</span>
                    <span>Total deuda: S/. {loan.totalAmountDue}</span>
                </div>
            </div>

            <div className="text-left w-full mb-4">
                <h3 className="font-bold text-[var(--primary)] mb-1">Comprobante de pago</h3>
                <p className="text-gray-500 text-sm">
                    Sube la captura de tu transferencia (Yape/Plin) por el monto indicado arriba.
                </p>
            </div>

            <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden"
                onClick={() => document.getElementById('payment-proof-upload')?.click()}>

                {preview ? (
                    <img src={preview} alt="Comprobante" className="w-full h-full object-cover" />
                ) : (
                    <>
                        <UploadCloud size={40} className="text-gray-300 mb-2" />
                        <span className="text-[var(--primary)] font-bold text-sm">Toca para subir imagen</span>
                    </>
                )}

                <input
                    id="payment-proof-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            <button
                onClick={onNext}
                disabled={!preview}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg text-white transition-colors mt-auto
                    ${!preview ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--primary)] hover:bg-[var(--primary-dark)]'}`}
            >
                Confirmar Envío
            </button>
        </div>
    );
};
