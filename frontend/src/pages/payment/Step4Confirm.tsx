import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Step4Props {
    data: any;
    onSubmit: () => void;
    result: any;
}

export const Step4Confirm: React.FC<Step4Props> = ({ data, onSubmit, result }) => {
    if (result) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center pt-20 px-8">
                <div className="w-24 h-24 rounded-full bg-[var(--accent)] flex items-center justify-center mb-6 shadow-inner">
                    <Check className="text-white w-12 h-12" strokeWidth={3} />
                </div>

                <h2 className="text-5xl font-bold text-[var(--primary)] mb-2">
                    S/.{data.amount}
                </h2>

                <p className="text-[var(--primary)] text-xl font-bold mb-12 text-center">
                    Pago enviado a revisión
                </p>

                <div className="w-full space-y-4 pb-12 mt-auto">
                    <Link to="/" className="block w-full border border-[var(--primary)] text-[var(--primary)] text-center font-bold py-4 rounded-xl">
                        Aceptar
                    </Link>
                </div>
            </div>
        );
    }

    // Confirmation Screen (reuse same style roughly or just auto-submit for MVP)
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-[var(--primary)] text-center mb-6">Confirmar Pago</h2>
            <div className="space-y-4">
                <button onClick={onSubmit} className="w-full bg-[var(--primary)] text-white py-4 rounded-xl font-bold">
                    Confirmar S/. {data.amount}
                </button>
            </div>
        </div>
    );
};
