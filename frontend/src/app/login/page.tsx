"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!email || !password) {
      setError('Por favor completa todos los campos obligatorios.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await login(email, password, remember);
      router.replace("/dashboard");
    } catch (e: any) {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[60%_40%] xl:grid-cols-[60%_40%] bg-[#F6F7FB]">
      {/* Sección de ilustración */}
      <section className="relative flex items-center justify-center p-16 lg:p-16 order-2 lg:order-1">
        <div className="absolute inset-0 opacity-25">
          <svg width="100%" height="100%" viewBox="0 0 800 600" className="w-full h-full">
            <path d="M0 200C100 150 200 250 300 200C400 150 500 250 600 200C700 150 800 250 800 200V0H0V200Z" fill="none" stroke="#9CA3AF" strokeWidth="1" opacity="0.25"/>
            <path d="M0 350C150 300 250 400 400 350C550 300 650 400 800 350V150C650 200 550 100 400 150C250 200 150 100 0 150V350Z" fill="none" stroke="#9CA3AF" strokeWidth="1" opacity="0.25"/>
            <path d="M0 500C200 450 300 550 500 500C700 450 800 550 800 500V300C600 350 500 250 300 300C100 350 0 250 0 300V500Z" fill="none" stroke="#9CA3AF" strokeWidth="1" opacity="0.25"/>
          </svg>
        </div>
        <Image
          src="/png/people-connecting.png"
          alt="Personas conectando un enchufe"
          width={700}
          height={500}
          className="max-w-full h-auto object-contain z-10 max-w-[90vw] lg:max-w-[700px]"
          loading="lazy"
        />
      </section>

      {/* Sección del formulario */}
      <section className="flex flex-col items-center justify-center p-8 lg:p-8 order-1 lg:order-2">
        <h1 className="text-[32px] lg:text-[40px] leading-[40px] lg:leading-[48px] font-bold text-[#2B2F38] mb-6 text-left w-full max-w-[420px]">
          Bienvenido a Nodo,<br />
          tu Sistema Social
        </h1>
        
        <div className="bg-white rounded-2xl lg:rounded-2xl p-7 lg:p-8 shadow-[0_10px_30px_rgba(17,24,39,0.07)] w-full max-w-[420px] animate-in fade-in duration-200">
          {error && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-3 rounded-xl mb-4 flex items-center text-sm">
              <span className="text-[#DC2626] mr-2">⚠</span>
              {error}
            </div>
          )}
          
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm leading-5 font-semibold tracking-[0.2px] text-[#2B2F38] mb-1.5">
                Tu correo electrónico *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full h-12 border border-[#E5E7EB] rounded-xl px-4 text-[15px] leading-[22px] transition-all duration-[120ms] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#93C5FD]"
                placeholder="Ingresa tu correo electrónico"
                required
                aria-required="true"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm leading-5 font-semibold tracking-[0.2px] text-[#2B2F38] mb-1.5">
                Tu contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="w-full h-12 border border-[#E5E7EB] rounded-xl px-4 pr-16 text-[15px] leading-[22px] transition-all duration-[120ms] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#93C5FD]"
                  placeholder="••••••••"
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm px-1 py-1"
                  aria-pressed={showPassword}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 border border-[#E5E7EB] rounded text-[#2563EB] focus:ring-2 focus:ring-[#93C5FD] focus:ring-offset-2"
              />
              <label htmlFor="remember" className="ml-2 text-sm leading-5 text-[#2B2F38] cursor-pointer">
                Recordarme
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#93C5FD] text-white font-semibold text-[15px] leading-[22px] tracking-[0.2px] rounded-xl transition-all duration-[120ms] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
        
        <div className="mt-6 text-right w-full max-w-[420px]">
          <div className="text-base font-bold text-[#2563EB] mb-1">Nodo</div>
          <div className="text-xs leading-4 font-medium text-[#6B7280] opacity-70">Powered by ICore</div>
        </div>
      </section>
    </main>
  );
}
