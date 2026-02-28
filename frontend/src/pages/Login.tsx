import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import logo from '../assets/logo.png';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Correo inválido'),
    password: z.string().min(1, 'Contraseña requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            const response = await api.post('/auth/login', data);
            login(response.data.token, response.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Credenciales incorrectas');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[var(--primary)]">
            {/* Animated Background Orbs */}
            <div className="absolute top-0 -left-20 w-80 h-80 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-teal-500 rounded-full blur-[140px] opacity-20 animate-pulse-slow"></div>

            <div className="max-w-md w-full relative z-10 animate-enter">
                <div className="text-center mb-10">
                    <img src={logo} alt="Logo" className="h-16 w-auto mx-auto mb-6 brightness-0 invert opacity-90" />
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Bienvenido a Cashback</h1>
                    <p className="text-white/60 font-medium">La evolución del micro-financiamiento.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/20 shadow-2xl relative">
                    <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Iniciar Sesión</h2>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-2xl mb-6 text-sm font-bold animate-shake flex items-center gap-3">
                            <span className="text-lg">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-1">
                            <label className="block text-white/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center text-white/30 group-focus-within:text-[var(--accent)] transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    {...register('email')}
                                    className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all placeholder:text-white/20"
                                    placeholder="tunombre@email.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-400 text-[10px] font-bold mt-1 ml-2">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-white/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Contraseña</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center text-white/30 group-focus-within:text-[var(--accent)] transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    {...register('password')}
                                    className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all placeholder:text-white/20"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="text-red-400 text-[10px] font-bold mt-1 ml-2">{errors.password.message}</p>}
                        </div>

                        <div className="flex justify-end pr-2">
                            <a href="#" className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-[var(--accent)] transition-colors">¿Olvidaste tu contraseña?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[var(--accent)] hover:bg-white text-[var(--primary)] font-black py-4 rounded-2xl text-lg shadow-xl shadow-[var(--primary)]/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest mt-4"
                        >
                            {isSubmitting ? 'Cargando...' : 'Entrar'}
                            <LogIn size={20} />
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/10">
                        <p className="text-center text-white/50 text-xs font-medium">
                            ¿Aún no tienes cuenta? <br />
                            <Link to="/register" className="text-white font-black hover:text-[var(--accent)] transition-colors inline-block mt-2 flex items-center justify-center gap-1 group">
                                Regístrate Gratis <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-white/30">
                    <ShieldCheck size={14} />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Acceso Encriptado de Grado Bancario</span>
                </div>
            </div>
        </div>
    );
}
