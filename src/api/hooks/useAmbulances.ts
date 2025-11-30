import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getAmbulances,
  getAvailableAmbulances,
  getAmbulanceById,
  updateAmbulanceStatus,
  updateAmbulanceLocation,
} from '../services/ambulances';
import type {
  Ambulance,
  UpdateAmbulanceStatusRequest,
  UpdateAmbulanceLocationRequest,
} from '../types';

// Query Keys
export const ambulanceKeys = {
  all: ['ambulances'] as const,
  lists: () => [...ambulanceKeys.all, 'list'] as const,
  list: () => [...ambulanceKeys.lists()] as const,
  available: () => [...ambulanceKeys.lists(), 'available'] as const,
  details: () => [...ambulanceKeys.all, 'detail'] as const,
  detail: (id: number) => [...ambulanceKeys.details(), id] as const,
};

/**
 * Hook to fetch all ambulances
 */
export function useAmbulances(
  options?: Omit<UseQueryOptions<Ambulance[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ambulanceKeys.list(),
    queryFn: getAmbulances,
    ...options,
  });
}

/**
 * Hook to fetch available (IDLE) ambulances
 */
export function useAvailableAmbulances(
  options?: Omit<UseQueryOptions<Ambulance[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ambulanceKeys.available(),
    queryFn: getAvailableAmbulances,
    ...options,
  });
}

/**
 * Hook to fetch a specific ambulance by ID
 */
export function useAmbulance(
  id: number,
  options?: Omit<UseQueryOptions<Ambulance, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ambulanceKeys.detail(id),
    queryFn: () => getAmbulanceById(id),
    enabled: id > 0,
    ...options,
  });
}

/**
 * Hook to update ambulance status
 */
export function useUpdateAmbulanceStatus(
  options?: Omit<
    UseMutationOptions<Ambulance, Error, { id: number; data: UpdateAmbulanceStatusRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateAmbulanceStatus(id, data),
    onSuccess: (data, variables) => {
      // Update the specific ambulance in cache
      queryClient.setQueryData(ambulanceKeys.detail(variables.id), data);
      // Invalidate ambulance lists
      void queryClient.invalidateQueries({ queryKey: ambulanceKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update ambulance location
 */
export function useUpdateAmbulanceLocation(
  options?: Omit<
    UseMutationOptions<Ambulance, Error, { id: number; data: UpdateAmbulanceLocationRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateAmbulanceLocation(id, data),
    onSuccess: (data, variables) => {
      // Update the specific ambulance in cache
      queryClient.setQueryData(ambulanceKeys.detail(variables.id), data);
      // Invalidate ambulance lists
      void queryClient.invalidateQueries({ queryKey: ambulanceKeys.lists() });
    },
    ...options,
  });
}
