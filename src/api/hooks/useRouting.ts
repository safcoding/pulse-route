import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { calculateRoute } from '../services/routing';
import type { CalculateRouteRequest, CalculateRouteResponse } from '../types';

/**
 * Hook to calculate a route between two points
 */
export function useCalculateRoute(
  options?: Omit<
    UseMutationOptions<CalculateRouteResponse, Error, CalculateRouteRequest>,
    'mutationFn'
  >
) {
  return useMutation({
    mutationFn: calculateRoute,
    ...options,
  });
}
