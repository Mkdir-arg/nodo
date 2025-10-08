'use client';

import { useAuth as useAuthFromContext } from '@/lib/AuthContext';

export function useAuth() {
  return useAuthFromContext();
}