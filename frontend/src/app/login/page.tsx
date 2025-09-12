"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Esquema de validación con Zod
const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Enter a valid email address" }),
  password: z
    .string()
    .min(1, { message: "Please enter your password" }),
});
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Maneja el submit del formulario
  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    try {
      const res = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      const tokenData = await res.json();
      // Guardar token JWT en localStorage
      localStorage.setItem("token", tokenData.access);
      // Redirigir al dashboard
      router.push("/dashboard");
    } catch (error) {
      // Mostrar mensaje de error en caso de fallo
      setErrorMsg("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      {/* Contenedor del card de login */}
      <div className="max-w-4xl w-full bg-gray-800 text-white rounded-lg shadow md:flex overflow-hidden">
        {/* Sección izquierda: formulario */}
        <div className="w-full md:w-1/2 p-6 space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Sign in to your account
          </h2>
          {/* Botones sociales (decorativos) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              className="w-full text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55"
            >
              {/* Icono de Google */}
              <svg
                className="mr-2 -ml-1 w-4 h-4"
                aria-hidden="true"
                focusable="false"
                data-icon="google"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504...41.4z"
                ></path>
              </svg>
              Sign in with Google
            </button>
            <button
              type="button"
              className="w-full text-white bg-[#050708] hover:bg-[#050708]/90 focus:ring-4 focus:ring-[#050708]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30"
            >
              {/* Icono de Apple */}
              <svg
                className="mr-2 -ml-1 w-5 h-5"
                aria-hidden="true"
                focusable="false"
                data-icon="apple"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
              >
                <path
                  fill="currentColor"
                  d="M318.7 268.7c-0.2-36.7 16.4-64.4 50-84.8...69.5-34.3z"
                ></path>
              </svg>
              Sign in with Apple
            </button>
          </div>
          {/* Separador "Or" */}
          <div className="flex items-center my-4">
            <hr className="w-full border-gray-600" />
            <span className="px-3 text-gray-400 text-sm">Or</span>
            <hr className="w-full border-gray-600" />
          </div>
          {/* Mensaje de error si las credenciales son inválidas */}
          {errorMsg && (
            <p className="text-sm text-red-500">{errorMsg}</p>
          )}
          {/* Formulario de email y contraseña */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block mb-1 text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email")}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="name@company.com"
                required
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register("password")}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="••••••••"
                required
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm font-medium text-gray-300"
                >
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-blue-500 hover:underline">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Sign in to your account
            </button>
          </form>
          <p className="text-sm text-gray-400 mt-4">
            Don’t have an account?{' '}
            <a href="#" className="font-medium text-blue-500 hover:underline">
              Sign up
            </a>
          </p>
        </div>
        {/* Sección derecha: ilustración */}
        <div
          className="hidden md:flex md:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: "url('/path/to/illustration.png')" }}
        />
      </div>
    </div>
  );
}

