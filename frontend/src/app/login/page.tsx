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




      <div className="relative w-full max-w-md">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bienvenido
            </h1>
            <p className="text-gray-600">Ingresá a tu cuenta para continuar</p>
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
                  className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl outline-none transition-colors duration-200 placeholder:text-gray-400 ${
                    focusedField === 'identifier'
                      ? 'border-blue-500 bg-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="tu@email.com"
                  onFocus={() => setFocusedField('identifier')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
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
                  className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl outline-none transition-colors duration-200 placeholder:text-gray-400 ${
                    focusedField === 'password'
                      ? 'border-blue-500 bg-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="••••••••••"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
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
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Ingresando...</span>
                </>
              ) : (
                <span>Ingresar</span>
              )}
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
