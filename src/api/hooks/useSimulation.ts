import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  createScenario,
  seedIncidents,
  analyzeText,
  getSimulationStatus,
  cancelSimulation,
  cancelAllSimulations,
} from '../services/simulation';
import type {
  CreateScenarioRequest,
  CreateScenarioResponse,
  SeedIncidentsRequest,
  SeedIncidentsResponse,
  AnalyzeTextRequest,
  AnalyzeTextResponse,
  SimulationStatus,
} from '../types';
import { incidentKeys } from './useIncidents';

// Query Keys
export const simulationKeys = {
  all: ['simulation'] as const,
  status: () => [...simulationKeys.all, 'status'] as const,
};

/**
 * Hook to get current simulation status
 */
export function useSimulationStatus(
  options?: Omit<UseQueryOptions<SimulationStatus, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: simulationKeys.status(),
    queryFn: getSimulationStatus,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    ...options,
  });
}

/**
 * Hook to create a demo scenario (God Mode)
 * Creates incident without phone call simulation
 */
export function useCreateScenario(
  options?: Omit<
    UseMutationOptions<CreateScenarioResponse, Error, CreateScenarioRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScenario,
    onSuccess: () => {
      // Invalidate incident lists to show new scenario
      void queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to seed multiple random incidents
 */
export function useSeedIncidents(
  options?: Omit<
    UseMutationOptions<SeedIncidentsResponse, Error, SeedIncidentsRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seedIncidents,
    onSuccess: () => {
      // Invalidate incident lists
      void queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to analyze text with mock AI
 */
export function useAnalyzeText(
  options?: Omit<
    UseMutationOptions<AnalyzeTextResponse, Error, AnalyzeTextRequest>,
    'mutationFn'
  >
) {
  return useMutation({
    mutationFn: analyzeText,
    ...options,
  });
}

/**
 * Hook to cancel a specific simulation
 */
export function useCancelSimulation(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSimulation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: simulationKeys.status() });
      void queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to cancel all active simulations
 */
export function useCancelAllSimulations(
  options?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelAllSimulations,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: simulationKeys.status() });
      void queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
    ...options,
  });
}
