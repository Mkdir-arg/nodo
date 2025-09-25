'use client';

import { getJSON } from '@/lib/api';

export interface SecurityConfig {
  inactivity_timeout_minutes: number;
}

export async function getSecurityConfig(): Promise<SecurityConfig> {
  return getJSON<SecurityConfig>('/auth/security-config/');
}