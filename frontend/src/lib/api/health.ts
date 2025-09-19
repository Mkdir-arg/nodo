import { getJSON } from './index';

export interface HealthResponse {
  message: string;
  version: string;
  endpoints: Record<string, string>;
}

export const healthApi = {
  // Health check endpoint
  check: (): Promise<HealthResponse> => getJSON<HealthResponse>('/'),
};