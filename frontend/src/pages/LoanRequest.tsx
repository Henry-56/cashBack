import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WizardLayout } from '../components/WizardLayout';
import { Step1Amount } from './steps/Step1Amount';
import { Step2Review } from './steps/Step2Review';
import { ContractStep } from './steps/ContractStep';
import { Step3Success } from './steps/Step3Success';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { toast } from 'react-hot-toast';

export default function LoanRequest() {
    const [searchParams] = useSearchParams();
    const initialAmount = searchParams.get('amount') ? parseInt(searchParams.get('amount') as string) : 100;

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        amount: initialAmount,
        termMonths: 1,
        interestRate: 15.0, // Default rate, could come from offer
        signatureBase64: '',
    });
    const [loanResult, setLoanResult] = useState<any>(null);
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);



    const updateData = (data: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    return (
        <WizardLayout
            title="Solicitar Préstamo"
            step={step}
            totalSteps={4}
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
                    onSubmit={nextStep}
                />
            )}
            {step === 3 && (
                <ContractStep
                    data={formData}
                    onSign={(sig, isSaved) => {
                        const payload = {
                            userId: user?.id,
                            amountRequested: formData.amount,
                            termMonths: formData.termMonths,
                            interestRate: formData.interestRate,
                            signatureBase64: isSaved ? undefined : sig,
                            useSavedSignature: isSaved
                        };

                        // Use a local handleSubmit to avoid stale closure issues or pass payload directly
                        api.post('/loans', payload)
                            .then(response => {
                                // Update user with signature if it was newly created
                                if (response.data.loan?.borrowerSignature && !user?.signatureUrl) {
                                    updateUser({ signatureUrl: response.data.loan.borrowerSignature });
                                }
                                setLoanResult(response.data);
                                setStep(4);
                            })
                            .catch(error => {
                                console.error("Loan request failed", error);
                                const errorMsg = error.response?.data?.error || "Error al solicitar el préstamo.";
                                toast.error(errorMsg);
                            });
                    }}
                    onBack={prevStep}
                />
            )}
            {step === 4 && loanResult && (
                <Step3Success
                    loan={loanResult.loan}
                />
            )}
        </WizardLayout>
    );
}
