import { create } from 'zustand';

type AnalyticsChatState = {
  open: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
};

/**
 * Hook global del chat analitico; sirve para abrir y cerrar el modulo flotante desde cualquier parte de la UI.
 */
export const useAnalyticsChatStore = create<AnalyticsChatState>((set) => ({
  open: false,
  /** Sirve para abrir el modulo flotante del chat analitico. */
  openPanel: () => set({ open: true }),
  /** Sirve para cerrar el modulo flotante del chat analitico. */
  closePanel: () => set({ open: false }),
  /** Sirve para alternar el estado del modulo flotante del chat analitico. */
  togglePanel: () => set((state) => ({ open: !state.open })),
}));
