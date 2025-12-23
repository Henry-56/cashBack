import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WizardLayout } from '../components/WizardLayout';
import { Step1SelectLoan } from './payment/Step1SelectLoan';
import { Step2InfoAndUpload } from './payment/Step2InfoAndUpload';
import { Step4Confirm } from './payment/Step4Confirm';
import api from '../api/client';

export default function PaymentFlow() {
    const { loanId } = useParams();
    // Start at step 2 if loanId exists
    const [step, setStep] = useState(loanId ? 2 : 1);
    const [loan, setLoan] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [paymentResult, setPaymentResult] = useState<any>(null);
    const navigate = useNavigate();

    // Fetch loan details if loanId is present or selected
    useEffect(() => {
        const id = loanId; // or from state if we add state for selectedId
        if (id) {
            api.get(`/loans/${id}`).then(res => setLoan(res.data)).catch(err => console.error(err));
        }
    }, [loanId]);

    const handleSelectLoan = async (id: string) => {
        // Fetch loan details on selection (if not using URL param)
        try {
            const res = await api.get(`/loans/${id}`);
            setLoan(res.data);
            setStep(2);
        } catch (e) { console.error(e); }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        try {
            console.log("Submitting payment for loan:", loan?.id, "with file:", file);

            // Upload proof logic (Mock URL for now as standard upload is complex to setup in 1 step without bucket)
            // In a real scenario we'd upload 'file' to S3/Cloudinary first.
            const proofUrl = "https://placeholder.com/payment-proof-mock.jpg";

            const installment = loan ? (parseFloat(loan.totalAmountDue) / parseFloat(loan.termMonths)).toFixed(2) : "0.00";

            await api.post(`/loans/${loan?.id || loanId}/pay`, {
                amount: parseFloat(installment),
                proofUrl: proofUrl
            });

            setPaymentResult({ status: 'COMPLETED', reference: 'PENDING-CONFIRMATION', amount: installment });
            nextStep(); // Go to step 3 (Confirm)

        } catch (error) {
            console.error(error);
            alert("Error al procesar el pago");
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
                    setFile={setFile}
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
