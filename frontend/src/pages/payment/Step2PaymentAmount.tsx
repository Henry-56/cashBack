import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Step2Props {
    amount: number;
    onUpdate: (amount: number) => void;
    onNext: () => void;
}

export const Step2PaymentAmount: React.FC<Step2Props> = ({ amount, onUpdate, onNext }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col p-6">
            <button onClick={() => navigate(-1)} className="self-start mb-10">
                <ArrowLeft className="text-[var(--primary)]" />
            </button>

            <div className="flex-1 flex flex-col items-center justify-center">
                <h1 className="text-[var(--primary)] font-bold text-2xl mb-2">Total a pagar</h1>

                <div className="text-center mb-4">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => onUpdate(Number(e.target.value))}
                        className="text-6xl font-bold text-[var(--primary)] text-center w-full focus:outline-none placeholder-[var(--primary)]/50"
                        placeholder="0.00"
                    />
                </div>

                <div className="bg-white text-gray-500 text-sm text-center space-y-1">
                    <p>Próxima cuota: <span className="font-bold text-[var(--primary)]">10 de mayo</span></p>
                    <p>Cuotas restantes: <span className="font-bold text-[var(--primary)]">3</span></p>
                </div>
            </div>

            <button
                onClick={onNext}
                disabled={!amount || amount <= 0}
                className="w-full bg-[var(--accent)] text-[var(--primary)] font-bold py-4 rounded-full text-lg shadow-lg hover:bg-opacity-90 disabled:opacity-50"
            >
                Pagar
            </button>
        </div>
    );
};
