import { create } from 'zustand';
import { PlantillasService } from '@/lib/services/plantillas';

type NavState = {
  legajosExpanded: boolean;
  plantillas: { id: string; nombre: string }[];
  refreshPlantillas: () => Promise<void>;
  setLegajosExpanded: (v: boolean) => void;
};

export const useNavStore = create<NavState>((set, get) => ({
  legajosExpanded: false,
  plantillas: [],
  setLegajosExpanded: (v) => set({ legajosExpanded: v }),
  refreshPlantillas: async () => {
    const r = await PlantillasService.fetchPlantillas({ estado: "ACTIVO", page_size: 1000 });
    set({ plantillas: r.results?.map((x:any)=>({id:x.id, nombre:x.nombre})) ?? [] });
  },
}));

if (typeof window !== "undefined") {
  const bc = new BroadcastChannel("nav-legajos");
  bc.onmessage = async (e) => {
    if (e?.data?.type === "refresh" || e?.data?.type === "refresh_and_expand") {
      await useNavStore.getState().refreshPlantillas();
      if (e?.data?.type === "refresh_and_expand") useNavStore.getState().setLegajosExpanded(true);
    }
  };
  window.addEventListener("storage", (ev) => {
    if (ev.key === "nav-legajos:ping") useNavStore.getState().refreshPlantillas();
  });
}
