import React from 'react';

interface CommissionDisplayProps {
    amount: number;
}

export const CommissionDisplay: React.FC<CommissionDisplayProps> = ({ amount }) => {
    const COMMISSION_RATE = 0.05;
    const commission = amount * COMMISSION_RATE;
    const netAmount = amount - commission;

    return (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
                <span>Monto Solicitado:</span>
                <span className="font-semibold">S/. {amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-red-500">
                <span>Comisión de Plataforma (5%):</span>
                <span className="font-bold">- S/. {commission.toFixed(2)}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 flex justify-between text-lg text-[var(--primary)] font-bold">
                <span>Monto a Recibir:</span>
                <span>S/. {netAmount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
                * La comisión se descuenta automáticamente del desembolso.
            </p>
        </div>
    );
};
