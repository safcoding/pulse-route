import { apiGet, apiPost, apiPatch, apiDelete } from '../client';
import type {
  ApiResponse,
  Incident,
  CreateIncidentRequest,
  CreateIncidentResponse,
  AssignAmbulanceRequest,
  AssignAmbulanceResponse,
  UpdateIncidentStatusRequest,
  AmbulanceCandidate,
} from '../types';

/**
 * List all incidents (active, completed, cancelled)
 * Optional query param: status (e.g., 'PENDING')
 */
export async function getIncidents(status?: string): Promise<Incident[]> {
  const params = status ? { status } : undefined;
  const response = await apiGet<ApiResponse<Incident[]>>('/incidents', { params });
  return response.data;
}

/**
 * List only active incidents
 */
export async function getActiveIncidents(): Promise<Incident[]> {
  const response = await apiGet<ApiResponse<Incident[]>>('/incidents/active');
  return response.data;
}

/**
 * Get a specific incident by ID
 */
export async function getIncidentById(id: string): Promise<Incident> {
  const response = await apiGet<ApiResponse<Incident>>(`/incidents/${id}`);
  return response.data;
}

/**
 * Get ranked ambulance candidates for an incident
 * Returns ambulances sorted by ETA and capability match
 */
export async function getIncidentCandidates(incidentId: string): Promise<AmbulanceCandidate[]> {
  const response = await apiGet<ApiResponse<AmbulanceCandidate[]>>(
    `/incidents/${incidentId}/candidates`
  );
  return response.data;
}

/**
 * Create a new incident. Automatically generates hospital recommendations.
 */
export async function createIncident(
  data: CreateIncidentRequest
): Promise<CreateIncidentResponse> {
  const response = await apiPost<ApiResponse<CreateIncidentResponse>, CreateIncidentRequest>(
    '/incidents',
    data
  );
  return response.data;
}

/**
 * Assign an ambulance to an incident
 * This immediately starts the movement simulation
 */
export async function assignAmbulanceToIncident(
  incidentId: string,
  data: AssignAmbulanceRequest
): Promise<AssignAmbulanceResponse> {
  const response = await apiPost<ApiResponse<AssignAmbulanceResponse>, AssignAmbulanceRequest>(
    `/incidents/${incidentId}/assign`,
    data
  );
  return response.data;
}

/**
 * Update incident status
 */
export async function updateIncidentStatus(
  id: string,
  data: UpdateIncidentStatusRequest
): Promise<Incident> {
  const response = await apiPatch<ApiResponse<Incident>, UpdateIncidentStatusRequest>(
    `/incidents/${id}/status`,
    data
  );
  return response.data;
}

/**
 * Delete an incident
 */
export async function deleteIncident(id: string): Promise<void> {
  await apiDelete(`/incidents/${id}`);
}
