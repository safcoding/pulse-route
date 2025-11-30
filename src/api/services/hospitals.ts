import { apiGet, apiPost } from '../client';
import type {
  ApiResponse,
  Hospital,
  HospitalWithAmbulances,
  UpdateHospitalStatusRequest,
} from '../types';

/**
 * Get all hospitals with their capabilities and ambulance counts
 */
export async function getHospitals(): Promise<Hospital[]> {
  const response = await apiGet<ApiResponse<Hospital[]>>('/hospitals');
  return response.data;
}

/**
 * Get a specific hospital with all its assigned ambulances
 */
export async function getHospitalById(id: number): Promise<HospitalWithAmbulances> {
  const response = await apiGet<ApiResponse<HospitalWithAmbulances>>(`/hospitals/${id}`);
  return response.data;
}

/**
 * Update hospital diverting status and load
 */
export async function updateHospitalStatus(
  id: number,
  data: UpdateHospitalStatusRequest
): Promise<Hospital> {
  const response = await apiPost<ApiResponse<Hospital>, UpdateHospitalStatusRequest>(
    `/hospitals/${id}/status`,
    data
  );
  return response.data;
}
