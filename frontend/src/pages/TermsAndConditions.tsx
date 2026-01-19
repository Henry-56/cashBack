import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, AlertTriangle, Scale, Lock, FileText } from 'lucide-react';
import logo from '../assets/logo.png';

export default function TermsAndConditions() {
    const navigate = useNavigate();
    const [accepted, setAccepted] = useState(false);

    const handleAccept = () => {
        localStorage.setItem('termsAccepted', 'true');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[var(--primary)] to-[var(--primary-dark)] flex flex-col">
            {/* Header */}
            <div className="p-6 flex items-center justify-center">
                <img src={logo} alt="Emony" className="h-12" />
            </div>

            {/* Content */}
            <div className="flex-1 bg-white rounded-t-3xl p-6 overflow-y-auto">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-[var(--primary)]/10 p-3 rounded-full">
                            <FileText className="text-[var(--primary)]" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--primary)]">Términos y Condiciones</h1>
                            <p className="text-sm text-gray-500">Última actualización: Enero 2026</p>
                        </div>
                    </div>

                    {/* Terms Sections */}
                    <div className="space-y-6 text-sm text-gray-700 leading-relaxed">

                        {/* Section 1 */}
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield size={18} className="text-[var(--primary)]" />
                                <h2 className="font-bold text-[var(--primary)]">1. Descripción del Servicio</h2>
                            </div>
                            <p>
                                Emony es una plataforma tecnológica que facilita la conexión entre personas
                                que solicitan préstamos y personas dispuestas a prestar dinero (modelo P2P).
                                <strong> Emony no es una entidad financiera</strong> y no proporciona el capital prestado.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <Scale size={18} className="text-[var(--primary)]" />
                                <h2 className="font-bold text-[var(--primary)]">2. Responsabilidades del Usuario</h2>
                            </div>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Proporcionar información veraz y actualizada</li>
                                <li>Cumplir con los compromisos de pago acordados</li>
                                <li>No utilizar la plataforma para actividades ilícitas</li>
                                <li>Mantener la confidencialidad de sus credenciales</li>
                                <li>Reportar cualquier uso no autorizado de su cuenta</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={18} className="text-amber-500" />
                                <h2 className="font-bold text-amber-600">3. Riesgos y Limitaciones</h2>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="mb-2">
                                    <strong>Importante:</strong> Los préstamos P2P conllevan riesgos inherentes:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>El prestatario puede incumplir el pago</li>
                                    <li>El prestamista asume el riesgo del capital</li>
                                    <li>Emony no garantiza la recuperación del dinero prestado</li>
                                    <li>Las tasas de interés son acordadas entre las partes</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <Lock size={18} className="text-[var(--primary)]" />
                                <h2 className="font-bold text-[var(--primary)]">4. Privacidad y Datos Personales</h2>
                            </div>
                            <p>
                                Recopilamos y procesamos datos personales conforme a la Ley N° 29733 (Ley de
                                Protección de Datos Personales del Perú). Sus datos son utilizados exclusivamente
                                para la operación de la plataforma y no serán compartidos con terceros sin su
                                consentimiento, salvo requerimiento legal.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 size={18} className="text-[var(--primary)]" />
                                <h2 className="font-bold text-[var(--primary)]">5. Limitación de Responsabilidad</h2>
                            </div>
                            <p>
                                Emony actúa únicamente como intermediario tecnológico. No somos responsables
                                por disputas entre usuarios, incumplimientos de pago, fraudes o pérdidas económicas
                                derivadas del uso de la plataforma. Cada usuario es responsable de verificar la
                                identidad y confiabilidad de las contrapartes.
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2 className="font-bold text-[var(--primary)] mb-2">6. Jurisdicción</h2>
                            <p>
                                Estos términos se rigen por las leyes de la República del Perú. Cualquier
                                controversia será resuelta ante los tribunales competentes de la ciudad de Lima.
                            </p>
                        </section>
                    </div>

                    {/* Acceptance Checkbox */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span className="text-sm text-gray-700">
                                He leído y acepto los <strong>Términos y Condiciones</strong> y la
                                <strong> Política de Privacidad</strong> de Emony. Entiendo los riesgos
                                asociados a los préstamos entre personas.
                            </span>
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 space-y-3">
                        <button
                            onClick={handleAccept}
                            disabled={!accepted}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all
                                ${accepted
                                    ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                            Aceptar y Continuar
                        </button>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-4">
                        Al continuar, confirmas que eres mayor de 18 años y resides en Perú.
                    </p>
                </div>
            </div>
        </div>
    );
}
