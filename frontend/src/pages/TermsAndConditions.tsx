import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import logo from '../assets/logo.png';

export default function TermsAndConditions() {
    const navigate = useNavigate();
    const [accepted, setAccepted] = useState(false);

    const handleAccept = () => {
        localStorage.setItem('termsAccepted', 'true');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[var(--primary)] text-white flex flex-col font-sans">
            {/* Header */}
            <div className="p-10 flex flex-col items-center">
                <img src={logo} alt="Cashback" className="h-12 mb-8 brightness-0 invert opacity-90" />
                <h1 className="text-4xl font-black tracking-tighter text-center">Protocolo Legal</h1>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Versión 2026.4.1</p>
            </div>

            {/* Content Container */}
            <div className="flex-1 bg-white rounded-t-[4rem] p-8 pb-64 overflow-y-auto shadow-2xl">
                <div className="max-w-xl mx-auto space-y-10">
                    <div className="flex items-center gap-4 py-8 border-b border-gray-50">
                        <div className="bg-indigo-50 p-4 rounded-[2rem] text-indigo-600 shadow-inner">
                            <FileText size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[var(--primary)] tracking-tight">Términos de Uso</h2>
                            <p className="text-xs text-gray-400 font-medium">Por favor, lee cuidadosamente antes de operar.</p>
                        </div>
                    </div>

                    {/* Section 1 */}
                    <section className="group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">01</div>
                            <h3 className="font-black text-[var(--primary)] uppercase tracking-widest text-[10px]">Ecosistema P2P</h3>
                        </div>
                        <div className="pl-11 pr-4">
                            <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                Cashback es una infraestructura tecnológica de enlace financiero. <strong className="text-[var(--primary)]">No somos una entidad bancaria.</strong> Facilitamos la conexión segura entre pares para el micro-financiamiento colaborativo.
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">02</div>
                            <h3 className="font-black text-[var(--primary)] uppercase tracking-widest text-[10px]">Compromiso de Veracidad</h3>
                        </div>
                        <div className="pl-11 pr-4 space-y-3">
                            <p className="text-gray-600 text-sm leading-relaxed font-medium">Al operar en la red, te comprometes a:</p>
                            <ul className="space-y-4">
                                {[
                                    'Identidad real y validada vía DNI.',
                                    'Cumplimiento estricto de los plazos acordados.',
                                    'Uso lícito de los fondos transaccionados.',
                                    'Protección absoluta de tus credenciales de acceso.'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 size={16} className="text-teal-500 shrink-0 mt-0.5" />
                                        <span className="text-gray-500 text-xs font-bold leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Risk Box */}
                    <section className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-amber-900"><AlertTriangle size={80} /></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle size={20} className="text-amber-600" />
                                <h3 className="font-black text-amber-900 uppercase tracking-widest text-[10px]">Advertencia de Riesgo</h3>
                            </div>
                            <p className="text-amber-800 text-xs font-medium leading-relaxed mb-4">
                                Las inversiones y préstamos entre personas operan bajo un modelo de <strong className="font-black">Riesgo Compartido</strong>. Cashback no garantiza la recuperación del capital si una de las partes incumple.
                            </p>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">03</div>
                            <h3 className="font-black text-[var(--primary)] uppercase tracking-widest text-[10px]">Privacidad de Grado Bancario</h3>
                        </div>
                        <div className="pl-11 pr-4">
                            <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                Protegemos tus datos bajo la Ley N° 29733 (Perú). Toda la información sensible y firmas digitales están encriptadas con estándares industriales.
                            </p>
                        </div>
                    </section>

                    {/* Sticky Footer for Acceptance */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-8 z-50 rounded-t-[3rem] shadow-2xl">
                        <div className="max-w-lg mx-auto">
                            <label className="flex items-start gap-4 cursor-pointer group mb-6">
                                <div className="relative flex items-center mt-1">
                                    <input
                                        type="checkbox"
                                        checked={accepted}
                                        onChange={(e) => setAccepted(e.target.checked)}
                                        className="appearance-none w-6 h-6 rounded-lg border-2 border-gray-200 checked:bg-[var(--primary)] checked:border-[var(--primary)] transition-all cursor-pointer"
                                    />
                                    {accepted && <CheckCircle2 size={14} className="absolute inset-0 m-auto text-white pointer-events-none" />}
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-tight group-hover:text-[var(--primary)] transition-colors">
                                    He comprendido el protocolo legal y acepto operar bajo estos términos de confianza.
                                </span>
                            </label>

                            <button
                                onClick={handleAccept}
                                disabled={!accepted}
                                className={`w-full py-6 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] shadow-2xl
                                    ${accepted
                                        ? 'bg-[var(--primary)] text-white shadow-indigo-500/20 active:scale-95'
                                        : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'}`}
                            >
                                Iniciar Operaciones <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
