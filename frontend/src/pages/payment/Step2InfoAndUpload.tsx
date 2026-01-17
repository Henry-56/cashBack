import React, { useState } from 'react';
import { ArrowLeft, UploadCloud, Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import { toast } from 'react-hot-toast';

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

    // Calculate installment
    const installmentAmount = loan ? (parseFloat(loan.totalAmountDue) / parseFloat(loan.termMonths)).toFixed(2) : "0.00";

    const validateImage = async (file: File) => {
        setIsValidating(true);
        setValidationStatus('idle');
        setValidationMessage('Analizando comprobante con IA...');

        try {
            const result = await Tesseract.recognize(
                file,
                'eng+spa', // Use both English and Spanish models
                {
                    logger: m => console.log(m)
                }
            );

            const text = result.data.text.toLowerCase();
            console.log("Extracted text:", text);

            // PRIMARY keywords - must find at least one of these (app/bank names)
            const primaryKeywords = ['yape', 'plin', 'bcp', 'bbva', 'interbank', 'scotiabank'];

            // SECONDARY keywords - transaction indicators
            const transactionKeywords = ['pagaste', 'enviaste', 'recibiste', 'transferencia', 'operación', 'operacion', 'soles', 's/.'];

            const foundPrimary = primaryKeywords.filter(keyword => text.includes(keyword));
            const foundTransaction = transactionKeywords.filter(keyword => text.includes(keyword));

            console.log("Found primary:", foundPrimary);
            console.log("Found transaction:", foundTransaction);

            // Must have at least 1 primary keyword AND at least 1 transaction keyword
            if (foundPrimary.length > 0 && foundTransaction.length > 0) {
                setValidationStatus('valid');
                setValidationMessage(`¡Comprobante válido! Se detectó: ${foundPrimary[0]} + ${foundTransaction[0]}`);
                toast.success("Comprobante validado correctamente");
            } else if (foundPrimary.length > 0) {
                // Found app name but no transaction
                setValidationStatus('invalid');
                setValidationMessage('Se detectó la app pero no el comprobante de pago. Sube una captura del pago enviado.');
                toast.error("Sube la captura del pago, no solo la app");
            } else {
                setValidationStatus('invalid');
                setValidationMessage('No se detectó un comprobante de Yape o Plin válido. Por favor sube una captura de pantalla del pago realizado.');
                toast.error("No parece ser un comprobante válido");
            }

        } catch (error) {
            console.error("OCR Error:", error);
            setValidationStatus('invalid');
            setValidationMessage('Error al analizar la imagen. Intenta de nuevo.');
        } finally {
            setIsValidating(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));

            // Trigger validation
            validateImage(f);
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

                {/* Validation Status Indicator */}
                {preview && (
                    <div className={`mt-3 p-3 rounded-lg flex items-start space-x-2 text-sm transition-all
                        ${isValidating ? 'bg-blue-50 text-blue-700' : ''}
                        ${validationStatus === 'valid' ? 'bg-green-50 text-green-700' : ''}
                        ${validationStatus === 'invalid' ? 'bg-red-50 text-red-700' : ''}
                    `}>
                        {isValidating && <Loader2 className="animate-spin shrink-0" size={18} />}
                        {validationStatus === 'valid' && <CheckCircle className="shrink-0" size={18} />}
                        {validationStatus === 'invalid' && <AlertCircle className="shrink-0" size={18} />}
                        <span className="font-medium">{validationMessage}</span>
                    </div>
                )}
            </div>

            <div className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-gray-50 cursor-pointer transition-colors relative overflow-hidden
                ${validationStatus === 'valid' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-100'}
                ${validationStatus === 'invalid' ? 'border-red-300 bg-red-50' : ''}
            `}
                onClick={() => !isValidating && document.getElementById('payment-proof-upload')?.click()}>

                {preview ? (
                    <img src={preview} alt="Comprobante" className={`w-full h-full object-cover transition-opacity ${isValidating ? 'opacity-50' : 'opacity-100'}`} />
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
                    disabled={isValidating}
                />
            </div>

            <button
                onClick={onNext}
                disabled={!preview || isValidating || validationStatus !== 'valid'}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg text-white transition-colors mt-auto
                    ${!preview || isValidating || validationStatus !== 'valid' ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--primary)] hover:bg-[var(--primary-dark)]'}`}
            >
                {isValidating ? 'Analizando...' : 'Confirmar Envío'}
            </button>
        </div>
    );
};
