import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WizardLayout } from '../components/WizardLayout';
import { Step1Amount } from './steps/Step1Amount';
import { Step2Review } from './steps/Step2Review';
import { Step3Success } from './steps/Step3Success';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function LoanRequest() {
    const [searchParams] = useSearchParams();
    const initialAmount = searchParams.get('amount') ? parseInt(searchParams.get('amount') as string) : 100;

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        amount: initialAmount,
        termMonths: 1,
        interestRate: 15.0, // Default rate, could come from offer
    });
    const [loanResult, setLoanResult] = useState<any>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        try {
            if (!user) return;

            // Calculate dynamic interest rate: 1wk=2%, 2wk=3%, 3wk=4%, 4wk=5%
            const calculatedRate = formData.termMonths + 1;

            const payload = {
                userId: user.id,
                amountRequested: formData.amount,
                termMonths: formData.termMonths,
                interestRate: calculatedRate
            };

            const response = await api.post('/loans', payload);
            setLoanResult(response.data);
            nextStep(); // Go to success
        } catch (error) {
            console.error("Loan request failed", error);
            alert("Error al solicitar el préstamo. Intente nuevamente.");
        }
    };

    const updateData = (data: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    return (
        <WizardLayout
            title="Solicitar Préstamo"
            step={step}
            totalSteps={3}
            onBack={step === 1 ? () => navigate('/') : prevStep}
        >
            {step === 1 && (
                <Step1Amount
                    data={formData}
                    onUpdate={updateData}
                    onNext={nextStep}
                />
            )}
            {step === 2 && (
                <Step2Review
                    data={formData}
                    onSubmit={handleSubmit}
                />
            )}
            {step === 3 && loanResult && (
                <Step3Success
                    loan={loanResult.loan}
                    commission={loanResult.breakdown.commission}
                />
            )}
        </WizardLayout>
    );
}
