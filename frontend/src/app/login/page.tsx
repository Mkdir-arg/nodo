"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const identifier = formData.get('identifier') as string;
    const password = formData.get('password') as string;
    
    if (!identifier || !password) {
      setError('Completá todos los campos');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await login(identifier, password, true);
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e.message || "Error de autenticación");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      {/* Overlay de carga */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center space-y-4 animate-in">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">Iniciando sesión</p>
              <p className="text-sm text-gray-500">Verificando credenciales...</p>
            </div>
          </div>
        </div>
      )}

      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-violet-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card principal */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 border border-white/20 p-8 space-y-8 transform transition-all duration-500 hover:shadow-3xl hover:shadow-black/10">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 transform transition-transform duration-300 hover:scale-110">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Bienvenido
            </h1>
            <p className="text-gray-500 font-medium">Ingresá a tu cuenta para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Campo Usuario */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                Usuario o Email
              </label>
              <div className="relative">
                <input
                  name="identifier"
                  type="text"
                  className={`w-full px-4 py-4 bg-gray-50/50 border-2 rounded-2xl outline-none transition-all duration-300 placeholder:text-gray-400 ${
                    focusedField === 'identifier'
                      ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/10 scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="tu@email.com"
                  onFocus={() => setFocusedField('identifier')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 transition-opacity duration-300 pointer-events-none ${
                  focusedField === 'identifier' ? 'opacity-100' : 'opacity-0'
                }`} />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                Contraseña
              </label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  className={`w-full px-4 py-4 bg-gray-50/50 border-2 rounded-2xl outline-none transition-all duration-300 placeholder:text-gray-400 ${
                    focusedField === 'password'
                      ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/10 scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="••••••••••"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 transition-opacity duration-300 pointer-events-none ${
                  focusedField === 'password' ? 'opacity-100' : 'opacity-0'
                }`} />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center space-x-2">
                {isSubmitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Ingresando...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Sistema de Gestión de Legajos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
