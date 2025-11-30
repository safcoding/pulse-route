import { apiGet, apiPost, apiPatch } from '../client';
import type {
  ApiResponse,
  Hazard,
  CreateHazardRequest,
  UpdateHazardRequest,
} from '../types';

/**
 * List all hazards
 */
export async function getHazards(): Promise<Hazard[]> {
  const response = await apiGet<ApiResponse<Hazard[]>>('/hazards');
  return response.data;
}

/**
 * Get a specific hazard by ID
 */
export async function getHazardById(id: string): Promise<Hazard> {
  const response = await apiGet<ApiResponse<Hazard>>(`/hazards/${id}`);
  return response.data;
}

/**
 * Create a new hazard
 */
export async function createHazard(data: CreateHazardRequest): Promise<Hazard> {
  const response = await apiPost<ApiResponse<Hazard>, CreateHazardRequest>('/hazards', data);
  return response.data;
}

/**
 * Update hazard status
 */
export async function updateHazard(id: string, data: UpdateHazardRequest): Promise<Hazard> {
  const response = await apiPatch<ApiResponse<Hazard>, UpdateHazardRequest>(
    `/hazards/${id}`,
    data
  );
  return response.data;
}
