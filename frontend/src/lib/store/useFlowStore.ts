import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { flowsApi } from '@/lib/api/flows';
import type { ConditionConfig, Flow, FlowStep } from '@/lib/flows/types';

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

const createConditionId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `branch_${Math.random().toString(36).slice(2, 9)}`);

const cloneConditionConfig = (config?: ConditionConfig): ConditionConfig => {
  const cfg = config || { branches: [], fallbackNextStepId: undefined };
  return {
    branches: Array.isArray(cfg.branches)
      ? cfg.branches.map((branch, index) => ({
          id: branch?.id || createConditionId(),
          label: branch?.label || `Ruta ${index + 1}`,
          logic: branch?.logic === 'OR' ? 'OR' : 'AND',
          rules: Array.isArray(branch?.rules) ? branch.rules : [],
          nextStepId: branch?.nextStepId,
        }))
      : [],
    fallbackNextStepId: cfg.fallbackNextStepId,
  };
};

const assignConditionTarget = (step: FlowStep, targetId: string): FlowStep => {
  const cfg = cloneConditionConfig(step.config as ConditionConfig);
  const branches =
    cfg.branches.length > 0
      ? cfg.branches.map(branch => ({ ...branch }))
      : [
          {
            id: createConditionId(),
            label: 'Ruta 1',
            logic: 'AND',
            rules: [],
            nextStepId: undefined,
          },
        ];

  let assigned = false;
  const updatedBranches = branches.map(branch => {
    if (!assigned && !branch.nextStepId) {
      assigned = true;
      return { ...branch, nextStepId: targetId };
    }
    return branch;
  });

  const fallbackNextStepId = assigned
    ? cfg.fallbackNextStepId
    : cfg.fallbackNextStepId || targetId;

  return {
    ...step,
    config: {
      branches: updatedBranches,
      fallbackNextStepId,
    },
  };
};

const removeConditionReference = (step: FlowStep, removedStepId: string): FlowStep => {
  if (step.type !== 'condition') return step;
  const cfg = cloneConditionConfig(step.config as ConditionConfig);
  const updatedBranches = cfg.branches.map(branch =>
    branch.nextStepId === removedStepId ? { ...branch, nextStepId: undefined } : branch
  );
  const fallbackNextStepId =
    cfg.fallbackNextStepId === removedStepId ? undefined : cfg.fallbackNextStepId;

  return {
    ...step,
    config: {
      branches: updatedBranches,
      fallbackNextStepId,
    },
  };
};

let isLoading = false;

export const useFlowStore = create<FlowStore>((set, get) => ({
  flows: [],
  currentFlow: null,
  loading: false,
  error: null,

  loadFlows: async () => {
    if (isLoading) return; // Evitar llamadas concurrentes globalmente
    
    isLoading = true;
    set({ loading: true, error: null });
    try {
      const response = await flowsApi.getFlows();
      const flows = Array.isArray(response) ? response : (response?.results || []);
      set({ flows, loading: false });
    } catch (error) {
      set({ error: 'Error loading flows', loading: false, flows: [] });
    } finally {
      isLoading = false;
    }
  },

  addFlow: async (flowData) => {
    set({ loading: true, error: null });
    try {
      // Convert steps to steps_data for backend
      const backendData = { ...flowData };
      if (flowData.steps) {
        backendData.steps_data = flowData.steps;
        delete backendData.steps;
      }
      
      const newFlow = await flowsApi.createFlow(backendData);
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
      // Convert steps to steps_data for backend
      const backendUpdates = { ...updates };
      if (updates.steps) {
        backendUpdates.steps_data = updates.steps;
        delete backendUpdates.steps;
      }
      
      const updatedFlow = await flowsApi.updateFlow(id, backendUpdates);
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
    set((state) => {
      const updateSteps = (steps?: FlowStep[]) => {
        if (!steps) return [];
        const stepToDelete = steps.find(step => step.id === stepId);
        const successor = stepToDelete?.nextStepId;

        return steps
          .filter(step => step.id !== stepId)
          .map(step => {
            if (step.type === 'condition') {
              return removeConditionReference(step, stepId);
            }
            if (step.nextStepId === stepId) {
              return { ...step, nextStepId: successor };
            }
            return step;
          });
      };

      return {
        flows: (state.flows || []).map(flow =>
          flow.id === flowId
            ? {
                ...flow,
                steps: updateSteps(flow.steps),
                updatedAt: new Date().toISOString(),
              }
            : flow
        ),
        currentFlow:
          state.currentFlow?.id === flowId
            ? {
                ...state.currentFlow,
                steps: updateSteps(state.currentFlow.steps),
                updatedAt: new Date().toISOString(),
              }
            : state.currentFlow,
      };
    });
  },

  connectSteps: (flowId, sourceId, targetId) => {
    set((state) => {
      const updateSteps = (steps?: FlowStep[]) => {
        if (!steps) return [];
        return steps.map(step => {
          if (step.id !== sourceId) return step;
          if (step.type === 'condition') {
            return assignConditionTarget(step, targetId);
          }
          return { ...step, nextStepId: targetId };
        });
      };

      return {
        flows: (state.flows || []).map(flow =>
          flow.id === flowId
            ? {
                ...flow,
                steps: updateSteps(flow.steps),
                updatedAt: new Date().toISOString(),
              }
            : flow
        ),
        currentFlow:
          state.currentFlow?.id === flowId
            ? {
                ...state.currentFlow,
                steps: updateSteps(state.currentFlow.steps),
                updatedAt: new Date().toISOString(),
              }
            : state.currentFlow,
      };
    });
  },
}));
