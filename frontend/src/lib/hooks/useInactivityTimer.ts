'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface UseInactivityTimerOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: (remainingSeconds: number) => void;
  enabled?: boolean;
}

export function useInactivityTimer({
  timeoutMinutes = 30,
  warningMinutes = 2,
  onTimeout,
  onWarning,
  enabled = true
}: UseInactivityTimerOptions = {}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const router = useRouter();

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearTimeout(countdownRef.current);
    setShowWarning(false);
  }, []);

  const startCountdown = useCallback(() => {
    let seconds = warningMinutes * 60;
    setRemainingSeconds(seconds);
    setShowWarning(true);

    const countdown = () => {
      seconds -= 1;
      setRemainingSeconds(seconds);
      
      if (onWarning) {
        onWarning(seconds);
      }
      
      if (seconds > 0) {
        countdownRef.current = setTimeout(countdown, 1000);
      }
    };
    
    countdownRef.current = setTimeout(countdown, 1000);
  }, [warningMinutes, onWarning]);

  const resetTimer = useCallback(() => {
    if (!enabled || timeoutMinutes < 3) return; // No activar si el timeout es muy pequeño

    clearAllTimers();

    // Timer para mostrar advertencia (solo si hay tiempo suficiente)
    if (timeoutMinutes > warningMinutes) {
      const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
      warningRef.current = setTimeout(() => {
        startCountdown();
      }, warningTime);
    }

    // Timer para logout automático
    timeoutRef.current = setTimeout(() => {
      if (onTimeout) {
        onTimeout();
      } else {
        // Comportamiento por defecto: logout y redirección
        logout();
        router.push('/login');
      }
    }, timeoutMinutes * 60 * 1000);
  }, [timeoutMinutes, warningMinutes, onTimeout, enabled, router, clearAllTimers, startCountdown]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Configurar listeners de actividad
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Iniciar el timer
    resetTimer();

    return () => {
      // Limpiar listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      // Limpiar todos los timers
      clearAllTimers();
    };
  }, [resetTimer, enabled, clearAllTimers]);

  return { 
    resetTimer, 
    extendSession, 
    showWarning, 
    remainingSeconds,
    clearWarning: () => setShowWarning(false)
  };
}