import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Step3Props {
    loan: any;
}

export const Step3Success: React.FC<Step3Props> = ({ loan }) => {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-20 px-8">
            <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center mb-6">
                <Check className="text-green-500 w-12 h-12" strokeWidth={3} />
            </div>

            <h2 className="text-2xl font-bold text-[var(--primary)] text-center mb-8">
                Solicitud enviada<br />con éxito
            </h2>

            <div className="w-full space-y-4 mb-auto">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Monto solicitado:</span>
                    <span className="text-[var(--primary)] font-bold">S/. {loan.amountRequested}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Estado:</span>
                    <span className="text-[var(--primary)] font-bold">En revisión</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Tiempo estimado:</span>
                    <span className="text-[var(--primary)] font-bold">24 horas</span>
                </div>
            </div>

            <div className="w-full space-y-4 pb-12">
                <Link to="/loans" className="block w-full bg-[var(--primary)] text-white text-center font-bold py-4 rounded-xl shadow-lg">
                    Seguir préstamo
                </Link>
                <Link to="/" className="block w-full border border-[var(--primary)] text-[var(--primary)] text-center font-bold py-4 rounded-xl">
                    Ir al inicio
                </Link>
            </div>
        </div>
    );
};
