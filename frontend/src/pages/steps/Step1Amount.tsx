import React from 'react';
import { MoneyInput } from '../../components/MoneyInput';
import { X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Step1Props {
    data: {
        amount: number;
        termMonths: number;
    };
    onUpdate: (data: any) => void;
    onNext: () => void;
}

const OFFERS = [100, 250, 500];

export const Step1Amount: React.FC<Step1Props> = ({ data, onUpdate, onNext }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden relative">
                <div className="p-6 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center mb-4">
                        <Check className="text-green-500 w-8 h-8" />
                    </div>

                    <h2 className="text-xl font-bold text-[var(--primary)] mb-2">Solicitar préstamo</h2>
                    <p className="text-sm text-gray-500 mb-6">¿Quieres enviar una solicitud de préstamo por <span className="font-bold text-black">S/. {data.amount.toFixed(2)}</span>?</p>

                    <div className="space-y-4">
                        {/* Presets */}
                        <div className="flex justify-center space-x-2 mb-2">
                            {OFFERS.map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => onUpdate({ amount: amt })}
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${data.amount === amt ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'text-gray-500 border-gray-300'}`}
                                >
                                    S/.{amt}
                                </button>
                            ))}
                        </div>

                        {/* Custom Input */}
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">S/.</span>
                            <input
                                type="number"
                                value={data.amount}
                                onChange={(e) => onUpdate({ amount: Number(e.target.value) })}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-lg focus:border-[var(--primary)] focus:outline-none"
                                placeholder="Monto personalizado"
                            />
                        </div>

                        {/* Term Selector */}
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mb-2">
                            <span className="text-xs text-gray-500 font-bold ml-2">Plazo (Semanas):</span>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4].map(w => (
                                    <button
                                        key={w}
                                        onClick={() => onUpdate({ termMonths: w })}
                                        className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${data.termMonths === w ? 'bg-[var(--primary)] text-white shadow-md transform scale-110' : 'bg-white text-gray-400 border border-gray-200'}`}
                                    >
                                        {w}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Recibes:</span>
                                <span className="font-bold text-[var(--primary)]">S/. {data.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Interés ({data.termMonths + 1}%):</span>
                                <span className="font-bold text-green-600">S/. {(data.amount * ((data.termMonths + 1) / 100)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                                <span className="font-bold text-[var(--primary)]">A devolver:</span>
                                <span className="font-bold text-[var(--primary)]">S/. {(data.amount * (1 + (data.termMonths + 1) / 100)).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/" className="flex items-center justify-center border border-gray-300 text-gray-700 font-bold py-3 rounded-xl text-center">
                                Cancelar
                            </Link>
                            <button
                                onClick={onNext}
                                disabled={data.amount <= 0}
                                className="bg-[var(--primary-light)] text-white font-bold py-3 rounded-xl disabled:opacity-50"
                            >
                                Prestame
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
