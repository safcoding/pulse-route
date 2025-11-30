import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  dispatchAmbulance,
  getDispatchCandidates,
  cancelDispatchSimulation,
  type GetDispatchCandidatesParams,
} from '../services/dispatch';
import type { DispatchRequest, DispatchResponse, DispatchCandidate } from '../types';
import { incidentKeys } from './useIncidents';
import { ambulanceKeys } from './useAmbulances';

// Query Keys
export const dispatchKeys = {
  all: ['dispatch'] as const,
  candidates: (params: GetDispatchCandidatesParams) =>
    [...dispatchKeys.all, 'candidates', params] as const,
};

/**
 * Hook to get dispatch candidates for a location
 */
export function useDispatchCandidates(
  params: GetDispatchCandidatesParams,
  options?: Omit<UseQueryOptions<DispatchCandidate[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dispatchKeys.candidates(params),
    queryFn: () => getDispatchCandidates(params),
    enabled: params.lat !== 0 && params.lng !== 0,
    ...options,
  });
}

/**
 * Hook to dispatch an ambulance
 */
export function useDispatchAmbulance(
  options?: Omit<UseMutationOptions<DispatchResponse, Error, DispatchRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dispatchAmbulance,
    onSuccess: () => {
      // Invalidate incident and ambulance lists
      void queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ambulanceKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to cancel a dispatch simulation
 */
export function useCancelDispatchSimulation(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelDispatchSimulation,
    onSuccess: () => {
      // Invalidate incident and ambulance lists
      void queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ambulanceKeys.lists() });
    },
    ...options,
  });
}
