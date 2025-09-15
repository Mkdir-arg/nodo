import { create } from "zustand";

export type VisualConfig = {
  render_mode?: "classic" | "visual";
  header?: {
    variant?: "hero" | "card" | "compact";
    show_photo?: boolean;
    title?: string;
    subtitle?: string;
    id_badge?: string;
    state?: { value?: string; map?: Record<string, "success" | "warning" | "destructive" | "secondary"> };
    background?: { type?: "solid" | "gradient" | "image"; class?: string; url?: string };
    chips?: Array<{ label: string; value: string; icon?: string; as_progress?: boolean }>;
  };
  counters?: { layout?: "grid-2" | "grid-3" | "grid-4"; items: Array<{ id: string; label: string; value: string; icon?: string; trend?: string }> };
};

type State = {
  schema: any;
  setSchema: (s: any) => void;
  visualConfig: VisualConfig;
  setVisual: (patch: Partial<VisualConfig>) => void;
};

export const useTemplateStore = create<State>((set) => ({
  schema: { sections: [] },
  setSchema: (s) => set({ schema: s }),
  visualConfig: { render_mode: "classic", header: { variant: "card" }, counters: { layout: "grid-4", items: [] } },
  setVisual: (patch) =>
    set((st) => ({ visualConfig: { ...st.visualConfig, ...patch } })),
}));

