import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { ChevronLeft, UploadCloud, CheckCircle, Clock } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function LendFlow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loan, setLoan] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch loan details
        api.get(`/loans/${id}`).then(res => setLoan(res.data)).catch(err => console.error(err));
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleFund = async () => {
        setIsLoading(true);
        try {
            // 1. Upload File (Mocking for now unless generic upload exists)
            // In a real app we'd upload to cloud storage here
            const proofUrl = "https://placeholder.com/proof.jpg";

            if (!user?.id) {
                toast.error("Error: No estás identificado correctamente. Por favor inicia sesión nuevamente.");
                return;
            }

            const payload = {
                lenderId: user.id,
                proofUrl
            };
            console.log("Funding Loan with payload:", payload);

            // 2. Call Fund Endpoint
            await api.post(`/loans/${id}/fund`, payload);

            setStep(3); // Success
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.error || "Error al procesar el préstamo";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    if (!loan) return <div>Cargando...</div>;

    // Calculate actual profit based on DB values
    const profit = (parseFloat(loan.totalAmountDue) - parseFloat(loan.amountRequested)).toFixed(2);
    // const totalReturn = loan.totalAmountDue;

    return (
        <MainLayout>
            <div className="bg-white min-h-screen pb-20">
                {/* Header */}
                <div className="p-4 flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="flex-1 text-center font-bold text-lg">
                        {step === 1 ? 'Confirmar Préstamo' : step === 2 ? 'Subir Comprobante' : '¡Éxito!'}
                    </h1>
                    <div className="w-8"></div>
                </div>

                {step === 1 && (
                    <div className="p-8 flex flex-col items-center text-center space-y-6">
                        <div className="w-24 h-24 bg-[var(--accent)] rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={48} className="text-[var(--primary)]" />
                        </div>

                        <div>
                            <h2 className="text-[var(--primary)] font-bold text-2xl mb-1">Vas a prestar</h2>
                            <h1 className="text-[var(--primary)] font-bold text-5xl mb-4">S/.{loan.amountRequested}</h1>
                            <p className="text-gray-600">
                                y ganar <span className="font-bold text-[var(--primary)]">S/.{profit}</span> en el plazo de <br />
                                <span className="font-bold text-[var(--primary)]">{loan.termMonths} semana(s)</span>
                            </p>
                        </div>

                        <div className="py-4">
                            <p className="text-gray-500 mb-1">Solicitante</p>
                            <p className="text-xl font-bold text-[var(--primary)]">{loan.borrowerName || "Usuario Oculto"}</p>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-[var(--primary)] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[var(--primary-dark)] transition-colors"
                        >
                            Validar depósito
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-6 flex flex-col items-center text-center space-y-6">
                        <div className="text-left w-full">
                            <h3 className="font-bold text-[var(--primary)] text-xl mb-2">Sube tu comprobante de depósito</h3>
                            <p className="text-gray-500 text-sm">
                                Para validar el envío del préstamo, por favor adjunta la imagen del comprobante de la transferencia (Yape, Plin) o captura de la billetera digital.
                            </p>
                            <p className="text-xs text-gray-400 mt-2 flex items-center">
                                <Clock size={12} className="mr-1" /> Tu información será verificada y protegida.
                            </p>
                        </div>

                        <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden"
                            onClick={() => document.getElementById('file-upload')?.click()}>

                            {preview ? (
                                <img src={preview} alt="Comprobante" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <UploadCloud size={48} className="text-gray-300 mb-2" />
                                    <span className="text-[var(--primary)] font-bold">Subir archivo</span>
                                </>
                            )}

                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="w-full space-y-3">
                            <button className="text-[var(--primary)] font-bold text-sm">Tomar foto ahora</button>
                            <button className="text-[var(--primary)] font-bold text-sm">Elegir desde galería</button>
                        </div>

                        <button
                            onClick={handleFund}
                            disabled={isLoading || !file}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg text-white transition-colors mt-auto
                                ${isLoading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--primary)] hover:bg-[var(--primary-dark)]'}`}
                        >
                            {isLoading ? 'Enviando...' : 'Confirmar Envío'}
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="p-8 flex flex-col items-center text-center space-y-8 animate-enter">
                        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={64} className="text-green-500" />
                        </div>

                        <div>
                            <h2 className="text-[var(--primary)] font-bold text-2xl mb-2">Préstamo enviado exitosamente</h2>
                            <div className="bg-gray-50 p-6 rounded-xl text-left space-y-3 mt-6 border border-gray-100">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Has prestado:</span>
                                    <span className="font-bold text-[var(--primary)]">S/. {loan.amountRequested}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Receptor:</span>
                                    <span className="font-bold text-[var(--primary)]">{loan.borrowerName || "Usuario"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Ganancia estim:</span>
                                    <span className="font-bold text-green-600">S/. {profit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Estado:</span>
                                    <span className="font-bold text-yellow-600">Esperando Confirmación</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-4">
                                El solicitante recibirá una notificación para confirmar la recepción del dinero.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-[var(--primary)] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[var(--primary-dark)] mt-8"
                        >
                            Ir al inicio
                        </button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
