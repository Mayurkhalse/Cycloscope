import { useQuery } from '@tanstack/react-query';
import { fetchActiveSystems, fetchSystemStatus } from '../api/cyclones.api';

export const useActiveSystems = () => {
  const activeSystemsQuery = useQuery({
    queryKey: ['activeSystems'],
    queryFn: fetchActiveSystems,
    refetchInterval: 60000, // Refresh every 60 seconds
  });

  const systemStatusQuery = useQuery({
    queryKey: ['systemStatus'],
    queryFn: fetchSystemStatus,
    refetchInterval: 30000,
  });

  return {
    systems: activeSystemsQuery.data || [],
    isLoading: activeSystemsQuery.isLoading,
    isError: activeSystemsQuery.isError,
    systemStatus: systemStatusQuery.data,
    refetch: activeSystemsQuery.refetch,
  };
};
