'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login, getTokens } from "@/lib/auth";
import type { LoginSettings } from "@/lib/loginSettings";
import { Mail, Lock } from "lucide-react";

interface LoginPageClientProps {
  initialSettings: LoginSettings;
}

export default function LoginPageClient({ initialSettings }: LoginPageClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const loginSettings = initialSettings;

  useEffect(() => {
    const tokens = getTokens();
    if (tokens) {
      router.replace('/dashboard');
    }
  }, [router]);

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
      setError('Credenciales invalidas. Verifica tu correo y contrasena.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-[#F3F4F6] relative overflow-hidden">
      {/* Sección izquierda - Ilustración con ondas de fondo */}
      <section className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
        {/* Ondas azules de fondo - a la derecha */}
        <div className="absolute top-0 right-0 w-[calc(100%+300px)] h-full overflow-hidden">
          <Image
            src="/pattern-lines.png"
            alt=""
            width={1000}
            height={1080}
            className="object-cover object-right h-full ml-auto"
            priority
          />
        </div>
        
        {/* Ilustración de personas */}
        <Image
          src="/login-illustration.png"
          alt="Ilustración de login"
          width={869}
          height={692}
          className="max-w-full h-auto object-contain z-10 relative"
          priority
        />
      </section>

      {/* Sección derecha - Formulario */}
      <section className="w-[616px] h-screen bg-white flex flex-col items-center justify-center gap-[45px] p-8 relative">
        <div className="flex flex-col items-center w-full max-w-[384px]">
          {/* Título con imágenes */}
          <div className="flex flex-col items-center mb-[45px]">
            <Image
              src="/Bienvenido a Nodo,.png"
              alt="Bienvenido a Nodo,"
              width={500}
              height={60}
              className="object-contain"
              priority
            />
            <Image
              src="/tu Sistema Social.png"
              alt="tu Sistema Social"
              width={400}
              height={50}
              className="object-contain"
              priority
            />
          </div>

          {/* Formulario */}
          <div className="w-full p-6 bg-white rounded-xl border border-[#E5E7EB] shadow-[0px_1px_0.5px_0.05px_rgba(29,41,61,0.02)] flex flex-col gap-6 mb-[45px]">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2.5">
                <label htmlFor="email" className="flex items-center gap-0.5 text-sm font-medium leading-5 text-[#101828]">
                  Tu correo electronico
                  <span className="text-[#C70036]">*</span>
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl shadow-[0px_1px_0.5px_0.05px_rgba(29,41,61,0.02)]">
                  <Mail className="w-4 h-4 text-[#4A5565]" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="flex-1 bg-transparent text-sm leading-5 text-[#4A5565] placeholder:text-[#4A5565] outline-none"
                    placeholder="Ingresa tu correo electronico"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label htmlFor="password" className="flex items-center gap-0.5 text-sm font-medium leading-5 text-[#101828]">
                  Tu contraseña
                  <span className="text-[#C70036]">*</span>
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl shadow-[0px_1px_0.5px_0.05px_rgba(29,41,61,0.02)]">
                  <Lock className="w-4 h-4 text-[#4A5565]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="flex-1 bg-transparent text-sm leading-5 text-[#4A5565] outline-none"
                    placeholder="••••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded"
                />
                <label htmlFor="remember" className="text-sm font-medium leading-4 text-[#101828]">
                  Recordarme
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-primary-gradient text-white text-sm font-medium leading-5 rounded-xl shadow-[0px_1px_0.5px_0.05px_rgba(29,41,61,0.02)] hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>

          {/* Logo */}
          <div className="flex flex-col items-center">
            <Image
              src="/nodo-logo.png"
              alt="Nodo"
              width={220}
              height={80}
              className="object-contain"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
