"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { me, logout } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    me().then(setUser).catch((error) => {
      console.error('Error getting user info:', error);
      // Si hay error de autenticación, el AuthProvider se encargará de redirigir
    });
  }, []);

  if (!user) return <div className="flex items-center justify-center min-h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[600px]">
        <Image
          src="/login-illustration.png"
          alt="Ilustración"
          width={869}
          height={692}
          className="max-w-full h-auto object-contain"
          priority
        />
      </div>
    </main>
  );
}
