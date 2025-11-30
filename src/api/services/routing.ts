import { apiPost } from '../client';
import type {
  ApiResponse,
  CalculateRouteRequest,
  CalculateRouteResponse,
} from '../types';

/**
 * Calculate route between two points using Google Routes API
 */
export async function calculateRoute(
  data: CalculateRouteRequest
): Promise<CalculateRouteResponse> {
  const response = await apiPost<ApiResponse<CalculateRouteResponse>, CalculateRouteRequest>(
    '/routes/calculate',
    data
  );
  return response.data;
}
