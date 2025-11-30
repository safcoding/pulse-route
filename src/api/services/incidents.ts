import { apiGet, apiPost, apiPatch } from '../client';
import type {
  ApiResponse,
  Incident,
  CreateIncidentRequest,
  CreateIncidentResponse,
  AssignAmbulanceRequest,
  AssignAmbulanceResponse,
  UpdateIncidentStatusRequest,
} from '../types';

/**
 * List all incidents (active, completed, cancelled)
 */
export async function getIncidents(): Promise<Incident[]> {
  const response = await apiGet<ApiResponse<Incident[]>>('/incidents');
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
 * Manually assign an ambulance to an incident
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
