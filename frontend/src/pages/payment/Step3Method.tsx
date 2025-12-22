import React from 'react';
import { ArrowLeft, Banknote, Smartphone, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Step3Props {
    method: string;
    onUpdate: (method: string) => void;
    onNext: () => void;
}

const METHODS = [
    { id: 'BANK_TRANSFER', label: 'Transferencia Bancaria', icon: Banknote },
    { id: 'MOBILE_PAYMENT', label: 'Billetera Digital', icon: Smartphone },
    { id: 'CASH', label: 'Efectivo', icon: CreditCard },
];

export const Step3Method: React.FC<Step3Props> = ({ method, onUpdate, onNext }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4">
                    <ArrowLeft className="text-[var(--primary)]" />
                </button>
                <h1 className="text-[var(--primary)] font-bold text-xl">Método de pago</h1>
            </div>

            <div className="space-y-4">
                {METHODS.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => { onUpdate(m.id); onNext(); }}
                        className={`w-full p-6 rounded-2xl flex items-center justify-between transition-all ${method === m.id
                                ? 'bg-[var(--primary)] text-white shadow-lg'
                                : 'bg-gray-50 text-[var(--primary)] hover:bg-gray-100'
                            }`}
                    >
                        <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${method === m.id ? 'bg-white/20' : 'bg-gray-200'}`}>
                                <m.icon size={24} />
                            </div>
                            <span className="font-bold text-lg">{m.label}</span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
                Seleccione su método preferido para continuar.
            </div>
        </div>
    );
};
