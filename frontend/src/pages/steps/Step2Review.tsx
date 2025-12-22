import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Step2Props {
    data: {
        amount: number;
        termMonths: number;
        interestRate: number;
    };
    onSubmit: () => void;
}

export const Step2Review: React.FC<Step2Props> = ({ data, onSubmit }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[var(--bg-light)]">
            {/* Header */}
            <div className="bg-white p-4 flex items-center shadow-sm sticky top-0">
                <button onClick={() => navigate(-1)} className="mr-4">
                    <ArrowLeft className="text-[var(--primary)]" />
                </button>
                <h1 className="text-[var(--primary)] font-bold text-center flex-1 pr-8">Solicitar Préstamo</h1>
            </div>

            <div className="p-6">
                <div className="text-center mb-6">
                    <h2 className="text-[var(--primary)] font-bold text-lg">Revisa tu solicitud</h2>
                    <p className="text-gray-400 text-sm">Confirma los detalles antes de enviar</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Monto Solicitado:</span>
                        <span className="font-bold text-[var(--primary)]">S/. {data.amount.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-gray-100 my-2"></div>
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-[var(--primary)]">Monto a Recibir:</span>
                        <span className="text-[var(--primary)]">S/. {data.amount.toFixed(2)}</span>
                    </div>

                    <div className="bg-green-50 p-4 rounded-xl mt-4">
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-green-700">Interés por {data.termMonths} semana(s) ({data.termMonths + 1}%):</span>
                            <span className="font-bold text-green-700">+ S/. {(data.amount * ((data.termMonths + 1) / 100)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold mt-2 pt-2 border-t border-green-200">
                            <span className="text-[var(--primary)]">Total a Pagar:</span>
                            <span className="text-[var(--primary)]">S/. {(data.amount * (1 + (data.termMonths + 1) / 100)).toFixed(2)}</span>
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-400 text-center mt-2">* El interés varía según el plazo (2% - 5%).</p>

                    <div className="bg-gray-50 rounded-xl p-4 mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Plazo:</span>
                            <span className="font-bold">{data.termMonths} Semanas</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Cuotas:</span>
                            <span className="font-bold">{data.termMonths} cuota(s) semanales</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                            <span className="text-gray-500">Monto por cuota:</span>
                            <span className="font-bold text-[var(--primary)]">
                                S/. {((data.amount * (1 + (data.termMonths + 1) / 100)) / data.termMonths).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>1ra Cuota:</span>
                            <span>Próxima Semana</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onSubmit}
                    className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    Solicitar Préstamo
                </button>
            </div>
        </div>
    );
};
