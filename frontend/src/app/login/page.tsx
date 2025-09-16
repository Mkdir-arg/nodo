"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
          <p className="text-sm text-gray-500">Usá tu usuario o email y contraseña</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Usuario o email</label>
            <input
              name="identifier"
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="usuario o correo"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <input
              name="password"
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-black text-white py-2.5 disabled:opacity-50"
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>


        </form>
      </div>
    </div>
  );
}
