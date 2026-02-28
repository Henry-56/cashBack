import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WizardLayout } from '../components/WizardLayout';
import { Step1SelectLoan } from './payment/Step1SelectLoan';
import { Step2InfoAndUpload } from './payment/Step2InfoAndUpload';
import { Step4Confirm } from './payment/Step4Confirm';
import api from '../api/client';
import { toast } from 'react-hot-toast';

export default function PaymentFlow() {
    const { loanId } = useParams();
    const [step, setStep] = useState(loanId ? 2 : 1);
    const [loan, setLoan] = useState<any>(null);
    const [paymentResult, setPaymentResult] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (loanId) {
            api.get(`/loans/${loanId}`)
                .then(res => setLoan(res.data))
                .catch(err => {
                    console.error(err);
                    toast.error(err.response?.data?.error || "Error al cargar detalles del préstamo");
                });
        }
    }, [loanId]);

    const handleSelectLoan = async (id: string) => {
        try {
            const res = await api.get(`/loans/${id}`);
            setLoan(res.data);
            setStep(2);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Error al seleccionar préstamo");
        }
    };

    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        try {
            // Mock URL for now as standard upload is complex to setup in 1 step without bucket
            const proofUrl = "https://placeholder.com/payment-proof-mock.jpg";
            const installment = loan ? (parseFloat(loan.totalAmountDue) / parseFloat(loan.termMonths)).toFixed(2) : "0.00";

            await api.post(`/loans/${loan?.id}/pay`, {
                amount: parseFloat(installment),
                proofUrl: proofUrl
            });

            setPaymentResult({ status: 'COMPLETED', reference: 'PENDING-CONFIRMATION', amount: installment });
            setStep(3); // Go to step 3 (Success Confirm screen)

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Error al procesar el pago");
        }
    };

    return (
        <WizardLayout
            title="Realizar Pago"
            step={step}
            totalSteps={3}
            onBack={step === 1 ? () => navigate('/') : prevStep}
        >
            {step === 1 && (
                <Step1SelectLoan
                    onSelect={handleSelectLoan}
                />
            )}
            {step === 2 && (
                <Step2InfoAndUpload
                    loan={loan}
                    setFile={() => { }}
                    onNext={handleSubmit}
                />
            )}
            {step === 3 && (
                <Step4Confirm
                    data={{ amount: paymentResult?.amount }}
                    onSubmit={() => { }}
                    result={{ status: 'COMPLETED' }}
                />
            )}
        </WizardLayout>
    );
}
