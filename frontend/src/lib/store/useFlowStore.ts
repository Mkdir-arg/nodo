import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { flowsApi } from '@/lib/api/flows';
import type { Flow, FlowStep } from '@/lib/flows/types';

interface FlowStore {
  flows: Flow[];
  currentFlow: Flow | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadFlows: () => Promise<void>;
  addFlow: (flow: Omit<Flow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFlow: (id: string, updates: Partial<Flow>) => Promise<void>;
  deleteFlow: (id: string) => Promise<void>;
  setCurrentFlow: (flow: Flow | null) => void;
  
  // Step actions
  addStep: (flowId: string, step: Omit<FlowStep, 'id'>) => void;
  updateStep: (flowId: string, stepId: string, updates: Partial<FlowStep>) => void;
  deleteStep: (flowId: string, stepId: string) => void;
  connectSteps: (flowId: string, sourceId: string, targetId: string) => void;
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  flows: [],
  currentFlow: null,
  loading: false,
  error: null,

  loadFlows: async () => {
    set({ loading: true, error: null });
    try {
      const response = await flowsApi.getFlows();
      set({ flows: response.results, loading: false });
    } catch (error) {
      set({ error: 'Error loading flows', loading: false });
    }
  },

  addFlow: async (flowData) => {
    set({ loading: true, error: null });
    try {
      const newFlow = await flowsApi.createFlow(flowData);
      set((state) => ({
        flows: [...(state.flows || []), newFlow],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error creating flow', loading: false });
      throw error;
    }
  },

  updateFlow: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedFlow = await flowsApi.updateFlow(id, updates);
      set((state) => ({
        flows: (state.flows || []).map((flow) =>
          flow.id === id ? updatedFlow : flow
        ),
        currentFlow: state.currentFlow?.id === id ? updatedFlow : state.currentFlow,
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error updating flow', loading: false });
      throw error;
    }
  },

  deleteFlow: async (id) => {
    set({ loading: true, error: null });
    try {
      await flowsApi.deleteFlow(id);
      set((state) => ({
        flows: (state.flows || []).filter((flow) => flow.id !== id),
        currentFlow: state.currentFlow?.id === id ? null : state.currentFlow,
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error deleting flow', loading: false });
      throw error;
    }
  },

  setCurrentFlow: (flow) => {
    set({ currentFlow: flow });
  },

  addStep: (flowId, stepData) => {
    const newStep: FlowStep = {
      ...stepData,
      id: nanoid(),
    };

    set((state) => ({
      flows: (state.flows || []).map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              steps: [...(flow.steps || []), newStep],
              updatedAt: new Date().toISOString(),
            }
          : flow
      ),
      currentFlow: state.currentFlow?.id === flowId
        ? {
            ...state.currentFlow,
            steps: [...(state.currentFlow.steps || []), newStep],
            updatedAt: new Date().toISOString(),
          }
        : state.currentFlow,
    }));
  },

  updateStep: (flowId, stepId, updates) => {
    set((state) => ({
      flows: (state.flows || []).map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              steps: (flow.steps || []).map((step) =>
                step.id === stepId ? { ...step, ...updates } : step
              ),
              updatedAt: new Date().toISOString(),
            }
          : flow
      ),
      currentFlow: state.currentFlow?.id === flowId
        ? {
            ...state.currentFlow,
            steps: (state.currentFlow.steps || []).map((step) =>
              step.id === stepId ? { ...step, ...updates } : step
            ),
            updatedAt: new Date().toISOString(),
          }
        : state.currentFlow,
    }));
  },

  deleteStep: (flowId, stepId) => {
    set((state) => ({
      flows: (state.flows || []).map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              steps: (flow.steps || []).filter((step) => step.id !== stepId),
              updatedAt: new Date().toISOString(),
            }
          : flow
      ),
      currentFlow: state.currentFlow?.id === flowId
        ? {
            ...state.currentFlow,
            steps: (state.currentFlow.steps || []).filter((step) => step.id !== stepId),
            updatedAt: new Date().toISOString(),
          }
        : state.currentFlow,
    }));
  },

  connectSteps: (flowId, sourceId, targetId) => {
    set((state) => ({
      flows: (state.flows || []).map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              steps: (flow.steps || []).map((step) =>
                step.id === sourceId ? { ...step, nextStepId: targetId } : step
              ),
              updatedAt: new Date().toISOString(),
            }
          : flow
      ),
      currentFlow: state.currentFlow?.id === flowId
        ? {
            ...state.currentFlow,
            steps: (state.currentFlow.steps || []).map((step) =>
              step.id === sourceId ? { ...step, nextStepId: targetId } : step
            ),
            updatedAt: new Date().toISOString(),
          }
        : state.currentFlow,
    }));
  },
}));