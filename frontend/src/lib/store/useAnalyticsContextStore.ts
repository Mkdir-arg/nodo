import { create } from 'zustand';

type AnalyticsContextState = {
  plantillaId: string | null;
  source: string | null;
  setContext: (payload: { plantillaId: string; source: string }) => void;
  clearContext: () => void;
};

/**
 * Store global del contexto analitico; sirve para compartir la plantilla activa entre pantallas y el chat.
 */
export const useAnalyticsContextStore = create<AnalyticsContextState>((set) => ({
  plantillaId: null,
  source: null,
  /** Guarda el contexto actual; sirve para definir la plantilla activa y su origen. */
  setContext: (payload) => set({ plantillaId: payload.plantillaId, source: payload.source }),
  /** Limpia el contexto; sirve para evitar usar una plantilla invalida. */
  clearContext: () => set({ plantillaId: null, source: null }),
}));
