'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getTokens, logout } from '@/lib/auth';
import { getJSON } from '@/lib/api';
import { User } from '@/lib/permissions';

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
  const router = useRouter();
  const pathname = usePathname();

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
      // Obtener información del usuario
      getJSON<any>('/auth/me/')
        .then((userData) => {
          setUser({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            groups: userData.groups || [],
            is_superuser: userData.is_superuser
          });
          setIsAuthenticated(true);
        })
        .catch(() => {
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
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);