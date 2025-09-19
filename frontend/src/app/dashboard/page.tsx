"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { me, logout } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    me().then(setUser).catch(() => {});
  }, []);

  if (!user) return <div className="flex items-center justify-center min-h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Hola, {user.username || user.email}</h1>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="rounded-lg border px-3 py-1.5"
          >
            Cerrar sesión
          </button>
        </div>
        <p className="text-gray-600 mt-2">Home básico. Acá va el contenido.</p>
      </div>
    </main>
  );
}
