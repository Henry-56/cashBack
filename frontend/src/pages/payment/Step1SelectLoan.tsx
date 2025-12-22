import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Step1Props {
    onSelect: (loanId: string) => void;
}

export const Step1SelectLoan: React.FC<Step1Props> = ({ onSelect }) => {
    const { user } = useAuth();
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                if (!user) return;
                const res = await api.get(`/loans?userId=${user.id}`);
                setLoans(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchLoans();
    }, [user]);

    if (loading) return <div className="text-center p-4">Cargando préstamos...</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--primary)] text-center">Selecciona un préstamo</h2>
            {loans.length === 0 ? (
                <p className="text-center text-gray-500">No tienes préstamos activos.</p>
            ) : (
                loans.map((loan) => (
                    <button
                        key={loan.id}
                        onClick={() => onSelect(loan.id)}
                        className="w-full bg-white p-4 rounded-lg shadow border border-gray-200 hover:border-[var(--primary)] text-left"
                    >
                        <div className="flex justify-between font-bold">
                            <span>Préstamo #{loan.id.slice(0, 6)}</span>
                            <span>S/. {loan.totalAmountDue}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            Vence: 30 días
                        </div>
                    </button>
                ))
            )}
        </div>
    );
};
