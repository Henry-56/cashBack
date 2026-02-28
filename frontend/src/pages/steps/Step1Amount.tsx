import { useAuth } from '../../context/AuthContext';
import { Check, Info, TrendingUp, AlertTriangle } from 'lucide-react';

interface Step1Props {
    data: {
        amount: number;
        termMonths: number;
    };
    onUpdate: (data: any) => void;
    onNext: () => void;
}

const OFFERS = [100, 250, 500, 1000];
const RATES: Record<number, number> = { 1: 8, 2: 12, 3: 16, 4: 20 };

export const Step1Amount: React.FC<Step1Props> = ({ data, onUpdate, onNext }) => {
    const { user } = useAuth();
    const ratePercent = RATES[data.termMonths] || 20;
    const interestAmount = data.amount * (ratePercent / 100);
    const totalAmount = data.amount + interestAmount;

    // Credit Limit Logic
    const userRating = parseFloat(user?.rating || '1.0');
    const isRestricted = userRating <= 1.0;
    const creditLimit = isRestricted ? 100 : 5000; // Example limit for higher ratings
    const isOverLimit = data.amount > creditLimit;

    return (
        <div className="space-y-8 animate-enter">
            <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-teal-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                    <TrendingUp className="text-[var(--primary-light)] w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-[var(--primary)] tracking-tight mb-2">¿Cuánto necesitas?</h2>
                <p className="text-[var(--text-muted)] font-medium">Elige un monto o ingresa uno personalizado.</p>
            </div>

            <div className="space-y-6">
                {/* Presets Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {OFFERS.map(amt => {
                        const disabledByLimit = isRestricted && amt > creditLimit;
                        return (
                            <button
                                key={amt}
                                onClick={() => !disabledByLimit && onUpdate({ amount: amt })}
                                disabled={disabledByLimit}
                                className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${data.amount === amt
                                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg scale-105'
                                    : disabledByLimit
                                        ? 'bg-gray-50 text-gray-200 border-transparent cursor-not-allowed opacity-40'
                                        : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                S/.{amt}
                            </button>
                        );
                    })}
                </div>

                {/* Custom Input Area */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <span className={`text-2xl font-black ${isOverLimit ? 'text-red-500' : 'text-[var(--primary)]'}`}>S/.</span>
                    </div>
                    <input
                        type="number"
                        value={data.amount || ''}
                        onChange={(e) => onUpdate({ amount: Number(e.target.value) })}
                        className={`w-full bg-white pl-16 pr-6 py-8 rounded-[2rem] font-black text-4xl tracking-tighter border-2 shadow-premium focus:ring-4 transition-all outline-none placeholder:text-gray-200 ${isOverLimit ? 'border-red-200 text-red-500 focus:ring-red-100' : 'border-transparent text-[var(--primary)] focus:ring-[var(--primary-light)]/20'}`}
                        placeholder="0.00"
                    />
                    {isOverLimit && (
                        <div className="absolute bottom-[-24px] left-6 flex items-center gap-2 text-red-500 animate-bounce">
                            <AlertTriangle size={12} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Monto máximo permitido: S/. {creditLimit}</span>
                        </div>
                    )}
                </div>

                {/* Term Selector */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-sm font-black text-[var(--primary)] uppercase tracking-widest">Plazo Estimado</h4>
                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Semanas</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        {[1, 2, 3, 4].map(w => (
                            <button
                                key={w}
                                onClick={() => onUpdate({ termMonths: w })}
                                className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all border-2 ${data.termMonths === w
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105'
                                    : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'
                                    }`}
                            >
                                {w}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-[var(--primary)] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-center opacity-70">
                            <span className="text-xs font-bold uppercase tracking-widest">Monto a recibir</span>
                            <span className="font-bold">S/. {data.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest opacity-70">Interés Estimado ({ratePercent}%)</span>
                                <Info size={14} className="opacity-40" />
                            </div>
                            <span className="font-black text-teal-400">+ S/. {interestAmount.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-white/10 my-4"></div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Total a Devolver</p>
                                <h3 className="text-4xl font-black tracking-tighter">S/. {totalAmount.toFixed(2)}</h3>
                            </div>
                            <div className="bg-white/20 p-3 rounded-2xl">
                                <Check size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={onNext}
                    disabled={data.amount <= 0 || isOverLimit}
                    className={`w-full font-black py-6 rounded-[2rem] text-xl shadow-premium transition-all transform active:scale-95 disabled:opacity-50 disabled:transform-none mt-4 uppercase tracking-widest ${isOverLimit
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-[var(--accent)] hover:bg-white text-[var(--primary)] hover:-translate-y-1'
                        }`}
                >
                    {isOverLimit ? 'Monto excedido' : 'Continuar'}
                </button>
            </div>
        </div>
    );
};
