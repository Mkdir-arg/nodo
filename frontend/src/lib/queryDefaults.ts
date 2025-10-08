import type { DefaultOptions } from '@tanstack/react-query';

const STALE_TIME_MS = 60 * 1000; // 1 minuto
const GC_TIME_MS = 5 * 60 * 1000; // 5 minutos

export const defaultQueryClientOptions: DefaultOptions = {
  queries: {
    staleTime: STALE_TIME_MS,
    gcTime: GC_TIME_MS,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    retry: 1,
  },
  mutations: {
    retry: 0,
  },
};

export function buildQueryOptions<T extends DefaultOptions['queries']>(
  overrides?: T,
): DefaultOptions['queries'] {
  return {
    ...defaultQueryClientOptions.queries,
    ...(overrides ?? {}),
  };
}

