import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getIncidents,
  getActiveIncidents,
  getIncidentById,
  createIncident,
  assignAmbulanceToIncident,
  updateIncidentStatus,
} from '../services/incidents';
import type {
  Incident,
  CreateIncidentRequest,
  CreateIncidentResponse,
  AssignAmbulanceRequest,
  AssignAmbulanceResponse,
  UpdateIncidentStatusRequest,
} from '../types';
import { ambulanceKeys } from './useAmbulances';

// Query Keys
export const incidentKeys = {
  all: ['incidents'] as const,
  lists: () => [...incidentKeys.all, 'list'] as const,
  list: () => [...incidentKeys.lists()] as const,
  active: () => [...incidentKeys.lists(), 'active'] as const,
  details: () => [...incidentKeys.all, 'detail'] as const,
  detail: (id: string) => [...incidentKeys.details(), id] as const,
};

/**
 * Hook to fetch all incidents
 */
export function useIncidents(
  options?: Omit<UseQueryOptions<Incident[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: incidentKeys.list(),
    queryFn: getIncidents,
    ...options,
  });
}

/**
 * Hook to fetch active incidents only
 */
export function useActiveIncidents(
  options?: Omit<UseQueryOptions<Incident[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: incidentKeys.active(),
    queryFn: getActiveIncidents,
    ...options,
  });
}

/**
 * Hook to fetch a specific incident by ID
 */
export function useIncident(
  id: string,
  options?: Omit<UseQueryOptions<Incident, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: () => getIncidentById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create a new incident
 */
export function useCreateIncident(
  options?: Omit<
    UseMutationOptions<CreateIncidentResponse, Error, CreateIncidentRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      // Invalidate incident lists
      void queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to assign an ambulance to an incident
 */
export function useAssignAmbulance(
  options?: Omit<
    UseMutationOptions<
      AssignAmbulanceResponse,
      Error,
      { incidentId: string; data: AssignAmbulanceRequest }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ incidentId, data }) => assignAmbulanceToIncident(incidentId, data),
    onSuccess: (data, variables) => {
      // Update the incident in cache
      queryClient.setQueryData(incidentKeys.detail(variables.incidentId), data.incident);
      // Invalidate incident and ambulance lists
      void queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ambulanceKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update incident status
 */
export function useUpdateIncidentStatus(
  options?: Omit<
    UseMutationOptions<Incident, Error, { id: string; data: UpdateIncidentStatusRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateIncidentStatus(id, data),
    onSuccess: (data, variables) => {
      // Update the incident in cache
      queryClient.setQueryData(incidentKeys.detail(variables.id), data);
      // Invalidate incident lists
      void queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
    ...options,
  });
}
