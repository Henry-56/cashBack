import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import logo from '../assets/logo.png';
import { Mail, Lock, User, Phone, CreditCard, ArrowRight, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

const registerSchema = z.object({
    fullName: z.string().min(2, 'Nombre completo requerido'),
    email: z.string().email('Correo inválido'),
    documentNumber: z.string().min(8, 'DNI debe tener 8 dígitos').max(8, 'DNI debe tener 8 dígitos'),
    phone: z.string().min(9, 'Teléfono debe tener al menos 9 dígitos'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isValidatingDni, setIsValidatingDni] = useState(false);
    const [dniValidated, setDniValidated] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const documentNumber = watch('documentNumber');

    const handleValidateDni = async () => {
        if (documentNumber?.length !== 8) return;
        setIsValidatingDni(true);
        setError(null);
        try {
            const response = await api.get(`/auth/validate-dni?dni=${documentNumber}`);
            setValue('fullName', response.data.full_name, { shouldValidate: true, shouldDirty: true });
            setDniValidated(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'DNI no encontrado');
        } finally {
            setIsValidatingDni(false);
        }
    };

    const onSubmit = async (data: RegisterForm) => {
        setError(null);
        try {
            const { confirmPassword, ...payload } = data;
            const response = await api.post('/auth/register', payload);
            login(response.data.token, response.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al registrarse');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[var(--primary)] py-12">
            {/* Animated Background Orbs */}
            <div className="absolute top-0 -left-20 w-80 h-80 bg-indigo-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-teal-500 rounded-full blur-[140px] opacity-20 animate-pulse-slow"></div>

            <div className="max-w-md w-full relative z-10 animate-enter">
                <div className="text-center mb-10">
                    <img src={logo} alt="Logo" className="h-12 w-auto mx-auto mb-6 brightness-0 invert opacity-90" />
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Crea tu Cuenta</h1>
                    <p className="text-white/60 font-medium text-sm">Únete a la red de confianza financiera.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/20 shadow-2xl relative">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-2xl mb-6 text-sm font-bold animate-shake flex items-center gap-3">
                            <span className="text-lg">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* DNI Field with Validation */}
                        <div className="space-y-1">
                            <label className="block text-white/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Documento de Identidad (DNI)</label>
                            <div className="flex gap-2">
                                <div className="relative group flex-1">
                                    <div className="absolute inset-y-0 left-5 flex items-center text-white/30 group-focus-within:text-[var(--accent)] transition-colors">
                                        <CreditCard size={18} />
                                    </div>
                                    <input
                                        {...register('documentNumber')}
                                        className={`w-full bg-white/5 border text-white pl-12 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all placeholder:text-white/20 
                                            ${dniValidated ? 'border-teal-500/50' : 'border-white/10'}`}
                                        placeholder="8 dígitos"
                                    />
                                    {dniValidated && <CheckCircle2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-400" />}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleValidateDni}
                                    disabled={isValidatingDni || documentNumber?.length !== 8}
                                    className="bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white px-6 rounded-2xl font-black text-xs transition-all disabled:opacity-30 disabled:hover:bg-indigo-600 disabled:hover:text-white uppercase tracking-widest shadow-lg shadow-indigo-900/40"
                                >
                                    {isValidatingDni ? <Loader2 className="animate-spin" size={18} /> : 'Validar'}
                                </button>
                            </div>
                            {errors.documentNumber && <p className="text-red-400 text-[10px] font-bold mt-1 ml-2">{errors.documentNumber.message}</p>}
                        </div>

                        {/* Name Field */}
                        <div className="space-y-1">
                            <label className="block text-white/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Nombre Completo</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center text-white/30 group-focus-within:text-[var(--accent)] transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    {...register('fullName')}
                                    readOnly={dniValidated}
                                    className={`w-full bg-white/5 border border-white/10 text-white pl-12 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all placeholder:text-white/20 ${dniValidated ? 'opacity-70 grayscale cursor-not-allowed' : ''}`}
                                    placeholder="Validar DNI primero"
                                />
                            </div>
                            {errors.fullName && <p className="text-red-400 text-[10px] font-bold mt-1 ml-2">{errors.fullName.message}</p>}
                        </div>

                        {/* Phone and Email Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-white/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Teléfono</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-5 flex items-center text-white/30 group-focus-within:text-[var(--accent)] transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        {...register('phone')}
                                        className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 transition-all placeholder:text-white/20"
                                        placeholder="987..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-white/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-5 flex items-center text-white/30 group-focus-within:text-[var(--accent)] transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        {...register('email')}
                                        className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 transition-all placeholder:text-white/20"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-white/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-5 flex items-center text-white/30 group-focus-within:text-[var(--accent)] transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        {...register('password')}
                                        className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 transition-all placeholder:text-white/20"
                                        placeholder="••••••"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-white/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Confirmar</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-5 flex items-center text-white/30 group-focus-within:text-[var(--accent)] transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        {...register('confirmPassword')}
                                        className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 transition-all placeholder:text-white/20"
                                        placeholder="••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !dniValidated}
                            className="w-full bg-[var(--accent)] hover:bg-white text-[var(--primary)] font-black py-4 rounded-2xl text-lg shadow-xl shadow-[var(--primary)]/20 transition-all transform active:scale-95 disabled:opacity-30 disabled:grayscale disabled:transform-none flex items-center justify-center gap-3 uppercase tracking-widest mt-6"
                        >
                            {isSubmitting ? 'Procesando...' : 'Crear mi Cuenta'}
                            <ArrowRight size={20} />
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-center text-white/50 text-xs font-medium">
                            ¿Ya eres parte de Cashback? <br />
                            <Link to="/login" className="text-white font-black hover:text-[var(--accent)] transition-colors inline-block mt-2 group">
                                Iniciar Sesión Ahora
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-white/30">
                    <ShieldCheck size={14} />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Privacidad Protegida por Blockchain</span>
                </div>
            </div>
        </div>
    );
}
