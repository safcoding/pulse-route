import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getHospitals,
  getHospitalById,
  updateHospitalStatus,
} from '../services/hospitals';
import type {
  Hospital,
  HospitalWithAmbulances,
  UpdateHospitalStatusRequest,
} from '../types';

// Query Keys
export const hospitalKeys = {
  all: ['hospitals'] as const,
  lists: () => [...hospitalKeys.all, 'list'] as const,
  list: () => [...hospitalKeys.lists()] as const,
  details: () => [...hospitalKeys.all, 'detail'] as const,
  detail: (id: number) => [...hospitalKeys.details(), id] as const,
};

/**
 * Hook to fetch all hospitals
 */
export function useHospitals(
  options?: Omit<UseQueryOptions<Hospital[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: hospitalKeys.list(),
    queryFn: getHospitals,
    ...options,
  });
}

/**
 * Hook to fetch a specific hospital by ID
 */
export function useHospital(
  id: number,
  options?: Omit<UseQueryOptions<HospitalWithAmbulances, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: hospitalKeys.detail(id),
    queryFn: () => getHospitalById(id),
    enabled: id > 0,
    ...options,
  });
}

/**
 * Hook to update hospital status
 */
export function useUpdateHospitalStatus(
  options?: Omit<
    UseMutationOptions<Hospital, Error, { id: number; data: UpdateHospitalStatusRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateHospitalStatus(id, data),
    onSuccess: (data, variables) => {
      // Update the specific hospital in cache
      queryClient.setQueryData(hospitalKeys.detail(variables.id), (old: HospitalWithAmbulances | undefined) =>
        old ? { ...old, ...data } : old
      );
      // Invalidate hospital list
      void queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() });
    },
    ...options,
  });
}
