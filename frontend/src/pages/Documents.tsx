import { ArrowLeft, Image as ImageIcon, Search, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Documents() {
    const navigate = useNavigate();
    // Simplified for visual match

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-white p-4 flex items-center justify-between">
                <button onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <div className="flex space-x-4 text-orange-400">
                    <Search />
                    <Menu />
                </div>
            </div>

            <div className="px-6 py-4">
                <h1 className="text-xl font-bold text-[var(--primary)] text-center mb-2">Sube tu comprobante de depósito</h1>
                <p className="text-xs text-gray-500 text-center mb-8 px-4">
                    Para validar el pago, adjunta la imagen del comprobante de la transferencia captura de la billetera digital.
                </p>

                <div className="flex flex-col items-center justify-center space-y-4 mb-8">
                    <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                        <ImageIcon className="text-gray-300 w-12 h-12" />
                    </div>

                    <button className="bg-[var(--primary)] text-white px-8 py-3 rounded-lg font-bold text-sm">
                        Subir archivo
                    </button>

                    <button className="text-[var(--primary)] text-sm">
                        Tomar foto ahora
                    </button>
                </div>
            </div>
        </div>
    );
}
