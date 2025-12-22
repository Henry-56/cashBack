import React from 'react';

interface MoneyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({ label, error, className, ...props }) => {
    return (
        <div className={className}>
            <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 font-bold">S/.</span>
                <input
                    type="number"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-xl font-bold text-[var(--primary)]"
                    {...props}
                />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};
