import { apiGet, apiPost, apiDelete } from '../client';
import type {
  ApiResponse,
  DispatchRequest,
  DispatchResponse,
  DispatchCandidate,
  AmbulanceType,
} from '../types';

/**
 * Auto-dispatch the best ambulance to an incident and start simulation
 */
export async function dispatchAmbulance(data: DispatchRequest): Promise<DispatchResponse> {
  const response = await apiPost<ApiResponse<DispatchResponse>, DispatchRequest>(
    '/api/dispatch',
    data
  );
  return response.data;
}

export interface GetDispatchCandidatesParams {
  lat: number;
  lng: number;
  requiredType?: AmbulanceType;
}

/**
 * Get ranked list of ambulance candidates for a location without dispatching
 */
export async function getDispatchCandidates(
  params: GetDispatchCandidatesParams
): Promise<DispatchCandidate[]> {
  const response = await apiGet<ApiResponse<DispatchCandidate[]>>('/api/dispatch/candidates', {
    params: {
      lat: params.lat,
      lng: params.lng,
      requiredType: params.requiredType,
    },
  });
  return response.data;
}

/**
 * Cancel a running simulation for an incident
 */
export async function cancelDispatchSimulation(incidentId: string): Promise<void> {
  await apiDelete<ApiResponse<void>>(`/api/dispatch/simulations/${incidentId}`);
}
