"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/lib/auth";

const schema = z.object({
  identifier: z.string().min(3, "Ingresá usuario o email"),
  password: z.string().min(1, "Ingresá tu contraseña"),
  remember: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { remember: true } });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await login(data.identifier, data.password, data.remember);
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e.message || "Error de autenticación");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
          <p className="text-sm text-gray-500">Usá tu usuario o email y contraseña</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Usuario o email</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="usuario o correo"
              {...register("identifier")}
            />
            {errors.identifier && <p className="text-xs text-red-600 mt-1">{errors.identifier.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" {...register("remember")} />
              Recordarme
            </label>
            <a className="text-sm text-gray-500 hover:underline" href="#">¿Olvidaste tu contraseña?</a>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-black text-white py-2.5 disabled:opacity-50"
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>

          <div className="flex items-center gap-2">
            <button disabled className="flex-1 rounded-xl border py-2.5">Continuar con Google</button>
            <button disabled className="flex-1 rounded-xl border py-2.5">Continuar con Apple</button>
          </div>
        </form>
      </div>
    </div>
  );
}
