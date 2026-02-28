import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
    onSave: (signatureDataUrl: string) => void;
    onClear?: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear }) => {
    const sigCanvas = useRef<SignatureCanvas>(null);

    const clear = () => {
        sigCanvas.current?.clear();
        if (onClear) onClear();
    };

    const save = () => {
        if (sigCanvas.current?.isEmpty()) {
            alert("Por favor, dibuja tu firma antes de guardar.");
            return;
        }
        // Using getCanvas() instead of getTrimmedCanvas() because of a known import issue 
        // with the trim-canvas dependency in some environments.
        const canvas = sigCanvas.current?.getCanvas();
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 w-full h-64 overflow-hidden">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        className: 'w-full h-full cursor-crosshair',
                    }}
                />
            </div>
            <div className="flex space-x-4 w-full">
                <button
                    type="button"
                    onClick={clear}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                    Limpiar
                </button>
                <button
                    type="button"
                    onClick={save}
                    className="flex-1 py-2 px-4 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                    Guardar Firma
                </button>
            </div>
        </div>
    );
};
