'use client';
import { create } from 'zustand';

interface VisualState {
  visualConfig: any;
  setVisualConfig: (cfg: any) => void;
}

export const useVisualConfigStore = create<VisualState>((set) => ({
  visualConfig: {},
  setVisualConfig: (cfg) => set({ visualConfig: cfg }),
}));
