import { getJSON, postJSON, putJSON, deleteJSON } from './index';
import type { Flow } from '@/lib/flows/types';

export interface FlowsResponse {
  results: Flow[];
  count: number;
}

export const flowsApi = {
  // Get all flows
  getFlows: (): Promise<FlowsResponse> => 
    getJSON<FlowsResponse>('/flows/'),

  // Get single flow
  getFlow: (id: string): Promise<Flow> => 
    getJSON<Flow>(`/flows/${id}/`),

  // Create new flow
  createFlow: (flow: Omit<Flow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Flow> => 
    postJSON<Flow>('/flows/', flow),

  // Update flow
  updateFlow: (id: string, flow: Partial<Flow>): Promise<Flow> => 
    putJSON<Flow>(`/flows/${id}/`, flow),

  // Delete flow
  deleteFlow: (id: string): Promise<void> => 
    deleteJSON<void>(`/flows/${id}/`),

  // Execute flow
  executeFlow: (id: string): Promise<any> => 
    postJSON<any>(`/flows/${id}/execute/`, {}),

  // Get flow executions
  getFlowExecutions: (id: string): Promise<any[]> => 
    getJSON<any[]>(`/flows/${id}/executions/`),

  // Get flow candidates
  getFlowCandidates: (slug: string, params: Record<string, any> = {}): Promise<any> => {
    const searchParams = new URLSearchParams(params).toString();
    return getJSON<any>(`/flows/${slug}/candidates/?${searchParams}`);
  },

  // Start single flow
  startFlow: (slug: string, data: { legajo_id: string; plantilla_id: string; context?: any }): Promise<any> =>
    postJSON<any>(`/flows/${slug}/start/`, data),

  // Start bulk flow
  startFlowBulk: (slug: string, data: { legajo_ids: string[]; plantilla_id: string; context?: any }): Promise<any> =>
    postJSON<any>(`/flows/${slug}/start/bulk/`, data),

  // Get flow instances
  getFlowInstances: (slug: string, statusFilter?: string): Promise<any[]> => {
    const params = statusFilter ? `?status=${statusFilter}` : '';
    return getJSON<any[]>(`/flows/${slug}/instances/${params}`);
  },
};