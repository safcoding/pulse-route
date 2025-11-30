import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getHazards,
  getHazardById,
  createHazard,
  updateHazard,
} from '../services/hazards';
import type { Hazard, CreateHazardRequest, UpdateHazardRequest } from '../types';

// Query Keys
export const hazardKeys = {
  all: ['hazards'] as const,
  lists: () => [...hazardKeys.all, 'list'] as const,
  list: () => [...hazardKeys.lists()] as const,
  details: () => [...hazardKeys.all, 'detail'] as const,
  detail: (id: string) => [...hazardKeys.details(), id] as const,
};

/**
 * Hook to fetch all hazards
 */
export function useHazards(
  options?: Omit<UseQueryOptions<Hazard[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: hazardKeys.list(),
    queryFn: getHazards,
    ...options,
  });
}

/**
 * Hook to fetch a specific hazard by ID
 */
export function useHazard(
  id: string,
  options?: Omit<UseQueryOptions<Hazard, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: hazardKeys.detail(id),
    queryFn: () => getHazardById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create a new hazard
 */
export function useCreateHazard(
  options?: Omit<UseMutationOptions<Hazard, Error, CreateHazardRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHazard,
    onSuccess: () => {
      // Invalidate hazard lists
      void queryClient.invalidateQueries({ queryKey: hazardKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update a hazard
 */
export function useUpdateHazard(
  options?: Omit<
    UseMutationOptions<Hazard, Error, { id: string; data: UpdateHazardRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateHazard(id, data),
    onSuccess: (data, variables) => {
      // Update the hazard in cache
      queryClient.setQueryData(hazardKeys.detail(variables.id), data);
      // Invalidate hazard lists
      void queryClient.invalidateQueries({ queryKey: hazardKeys.lists() });
    },
    ...options,
  });
}
