import { apiGet, apiPatch } from '../client';
import type {
  ApiResponse,
  Ambulance,
  UpdateAmbulanceStatusRequest,
  UpdateAmbulanceLocationRequest,
} from '../types';

/**
 * Get all ambulances with status, location, and home hospital
 */
export async function getAmbulances(): Promise<Ambulance[]> {
  const response = await apiGet<ApiResponse<Ambulance[]>>('/ambulances');
  return response.data;
}

/**
 * Get only ambulances with IDLE status
 */
export async function getAvailableAmbulances(): Promise<Ambulance[]> {
  const response = await apiGet<ApiResponse<Ambulance[]>>('/ambulances/available');
  return response.data;
}

/**
 * Get details of a specific ambulance
 */
export async function getAmbulanceById(id: number): Promise<Ambulance> {
  const response = await apiGet<ApiResponse<Ambulance>>(`/ambulances/${id}`);
  return response.data;
}

/**
 * Update ambulance operational status
 */
export async function updateAmbulanceStatus(
  id: number,
  data: UpdateAmbulanceStatusRequest
): Promise<Ambulance> {
  const response = await apiPatch<ApiResponse<Ambulance>, UpdateAmbulanceStatusRequest>(
    `/ambulances/${id}/status`,
    data
  );
  return response.data;
}

/**
 * Update ambulance GPS coordinates
 */
export async function updateAmbulanceLocation(
  id: number,
  data: UpdateAmbulanceLocationRequest
): Promise<Ambulance> {
  const response = await apiPatch<ApiResponse<Ambulance>, UpdateAmbulanceLocationRequest>(
    `/ambulances/${id}/location`,
    data
  );
  return response.data;
}
