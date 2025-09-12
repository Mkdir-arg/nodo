"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { me, logout } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await me();
        setUser(u);
      } catch {
        router.replace("/login");
      }
    })();
  }, [router]);

  if (!user) return null;

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
