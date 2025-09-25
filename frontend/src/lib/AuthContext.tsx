'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getTokens, logout } from '@/lib/auth';
import { getJSON } from '@/lib/api';
import { User } from '@/lib/permissions';
import { useInactivityTimer } from '@/lib/hooks/useInactivityTimer';
import { getSecurityConfig } from '@/services/security';
import { InactivityWarning } from '@/components/ui/inactivity-warning';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [timeoutMinutes, setTimeoutMinutes] = useState(30);
  const router = useRouter();
  const pathname = usePathname();

  // Configurar timer de inactividad
  const handleInactivityTimeout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  const { showWarning, remainingSeconds, extendSession } = useInactivityTimer({
    timeoutMinutes,
    warningMinutes: 2, // Advertir 2 minutos antes
    onTimeout: handleInactivityTimeout,
    enabled: isAuthenticated && !isLoading && pathname !== '/login'
  });

  const handleExtendSession = () => {
    extendSession();
  };

  const handleLogoutFromWarning = () => {
    handleInactivityTimeout();
  };

  useEffect(() => {
    // No verificar en la página de login
    if (pathname === '/login') {
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    const tokens = getTokens();
    if (tokens) {
      // Obtener configuración de seguridad y información del usuario
      Promise.all([
        getJSON<any>('/auth/me/'),
        getSecurityConfig().catch(() => ({ inactivity_timeout_minutes: 30 }))
      ])
        .then(([userData, securityConfig]) => {
          setUser({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            groups: userData.groups || [],
            is_superuser: userData.is_superuser
          });
          setTimeoutMinutes(securityConfig.inactivity_timeout_minutes);
          setIsAuthenticated(true);
        })
        .catch((error) => {
          // Verificar si es error de inactividad
          if (error.message?.includes('INACTIVITY_TIMEOUT')) {
            // No mostrar error, solo hacer logout silencioso
          }
          // Limpiar tokens inválidos
          logout();
          setIsAuthenticated(false);
          setUser(null);
          // Solo redirigir si no estamos ya en login
          if (pathname !== '/login') {
            router.replace('/login');
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsAuthenticated(false);
      setUser(null);
      // Solo redirigir si no estamos ya en login
      if (pathname !== '/login') {
        router.replace('/login');
      }
      setIsLoading(false);
    }
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user }}>
      {children}
      <InactivityWarning
        isVisible={showWarning}
        remainingSeconds={remainingSeconds}
        onExtendSession={handleExtendSession}
        onLogout={handleLogoutFromWarning}
      />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);