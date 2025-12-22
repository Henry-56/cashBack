
import React, { useState } from 'react';
import { ArrowLeft, UploadCloud, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Step3Props {
    onNext: () => void;
    setFile: (file: File) => void;
}

export const Step3Upload: React.FC<Step3Props> = ({ onNext, setFile }) => {
    const navigate = useNavigate();
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    return (
        <div className="min-h-screen bg-white p-6 flex flex-col items-center">
            <div className="w-full flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4">
                    <ArrowLeft className="text-[var(--primary)]" />
                </button>
                <h1 className="text-[var(--primary)] font-bold text-xl">Subir comprobante</h1>
            </div>

            <div className="text-left w-full mb-6">
                <p className="text-gray-500 text-sm">
                    Para validar tu pago, por favor adjunta la captura de la transferencia (Yape, Plin).
                </p>
            </div>

            <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden"
                onClick={() => document.getElementById('payment-proof-upload')?.click()}>

                {preview ? (
                    <img src={preview} alt="Comprobante" className="w-full h-full object-cover" />
                ) : (
                    <>
                        <UploadCloud size={48} className="text-gray-300 mb-2" />
                        <span className="text-[var(--primary)] font-bold">Subir archivo</span>
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
                Confirmar Pago
            </button>
        </div>
    );
};
