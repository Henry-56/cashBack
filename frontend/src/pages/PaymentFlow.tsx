import { Step3Upload } from './payment/Step3Upload';

export default function PaymentFlow() {
    const { loanId } = useParams();
    // If loanId is present in URL, start at step 2, otherwise step 1
    const [step, setStep] = useState(loanId ? 2 : 1);
    const [formData, setFormData] = useState({
        loanId: loanId || '',
        amount: 0,
        method: 'BANK_TRANSFER', // Default
    });
    const [file, setFile] = useState<File | null>(null);
    const [paymentResult, setPaymentResult] = useState<any>(null);
    const navigate = useNavigate();

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const updateData = (data: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleSubmit = async () => {
        try {
            // Here we would upload the file and call the API
            console.log("Submitting payment with file:", file);

            setTimeout(() => {
                setPaymentResult({ status: 'COMPLETED', reference: 'TXN-mock-123' });
                // We are already at step 4 (the confirm step logic is inside Step4Confirm or we transition to it)
                // Actually, the wizard expects step 4 to render Step4Confirm.
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
                <Step3Upload
                    setFile={setFile}
                    onNext={() => {
                        handleSubmit(); // Submit immediately after upload confirmation? Or go to review? 
                        // User said "logic is the same... upload proof". usually you upload then confirm.
                        // Let's go to step 4 which shows success/validation.
                        nextStep();
                    }}
                />
            )}
            {step === 4 && (
                <Step4Confirm
                    data={formData}
                    onSubmit={() => { }} // Already submitted
                    result={{ status: 'COMPLETED' }} // Force success state for now
                />
            )}
        </WizardLayout>
    );
}
