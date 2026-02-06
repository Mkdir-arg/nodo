"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { canUseAnalytics } from "@/lib/permissions";

interface AnalyticsGuardOptions {
  redirectTo?: string;
}

/**
 * Hook de proteccion; sirve para evitar acceso a rutas del chat analitico cuando falta el permiso requerido.
 */
export function useAnalyticsGuard(options: AnalyticsGuardOptions = {}) {
  const { redirectTo = "/" } = options;
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!canUseAnalytics(user)) {
      router.replace(redirectTo);
    }
  }, [isLoading, user, router, redirectTo]);
}
