import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const registerSchema = z.object({
    fullName: z.string().min(2, 'Nombre completo requerido'),
    email: z.string().email('Correo inválido'),
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

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        try {
            // Exclude confirmPassword and call API
            const { confirmPassword, ...payload } = data;
            const response = await api.post('/auth/register', payload);
            login(response.data.token, response.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al registrarse');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-center text-[var(--primary)] mb-6">Crear Cuenta</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Nombre Completo</label>
                        <input
                            {...register('fullName')}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico</label>
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                        <input
                            {...register('phone')}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
                        <input
                            type="password"
                            {...register('password')}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Confirmar Contraseña</label>
                        <input
                            type="password"
                            {...register('confirmPassword')}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[var(--primary)] text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
                    >
                        {isSubmitting ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta? <Link to="/login" className="text-[var(--primary)] font-bold">Inicia Sesión</Link>
                </p>
            </div>
        </div>
    );
}
