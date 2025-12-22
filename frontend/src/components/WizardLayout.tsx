import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WizardLayoutProps {
    title: string;
    step: number;
    totalSteps: number;
    onBack?: () => void;
    children: React.ReactNode;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({ title, step, totalSteps, onBack, children }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-light)]">
            {/* Header */}
            <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
                <button onClick={handleBack} className="p-2 mr-2">
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-center pr-10">{title}</h1>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200 w-full">
                <div
                    className="h-full bg-[var(--primary)] transition-all duration-300"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                />
            </div>

            {/* Content */}
            <div className="p-4 max-w-md mx-auto">
                {children}
            </div>
        </div>
    );
};
