import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WizardLayout } from '../components/WizardLayout';
import { Step1SelectLoan } from './payment/Step1SelectLoan';
import { Step2PaymentAmount } from './payment/Step2PaymentAmount';
import { Step3Method } from './payment/Step3Method';
import { Step4Confirm } from './payment/Step4Confirm';

export default function PaymentFlow() {
    const { loanId } = useParams();
    // If loanId is present in URL, start at step 2, otherwise step 1
    const [step, setStep] = useState(loanId ? 2 : 1);
    const [formData, setFormData] = useState({
        loanId: loanId || '',
        amount: 0,
        method: 'BANK_TRANSFER', // Default
    });
    const [paymentResult, setPaymentResult] = useState<any>(null);
    const navigate = useNavigate();

    // If we have a loanId, we might want to fetch loan details to set default amount? 
    // For now, logic remains minimal.


    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const updateData = (data: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleSubmit = async () => {
        try {
            // Implement API call in next phase or mocked here
            // const response = await api.post('/payments', formData);
            // setPaymentResult(response.data);
            // For now, mock success to show flow
            setTimeout(() => {
                setPaymentResult({ status: 'COMPLETED', reference: 'TXN-mock-123' });
                nextStep();
            }, 1000);
        } catch (error) {
            alert("Error al procesar el pago");
        }
    };

    return (
        <WizardLayout
            title="Realizar Pago"
            step={step}
            totalSteps={4}
            onBack={step === 1 ? () => navigate('/') : prevStep}
        >
            {step === 1 && (
                <Step1SelectLoan
                    onSelect={(id) => { updateData({ loanId: id }); nextStep(); }}
                />
            )}
            {step === 2 && (
                <Step2PaymentAmount
                    amount={formData.amount}
                    onUpdate={(amt: number) => updateData({ amount: amt })}
                    onNext={nextStep}
                />
            )}
            {step === 3 && (
                <Step3Method
                    method={formData.method}
                    onUpdate={(m: string) => updateData({ method: m })}
                    onNext={nextStep}
                />
            )}
            {step === 4 && (
                <Step4Confirm
                    data={formData}
                    onSubmit={handleSubmit}
                    result={paymentResult}
                />
            )}
        </WizardLayout>
    );
}
