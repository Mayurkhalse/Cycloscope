import { useQuery } from '@tanstack/react-query';
import { fetchHistoricalStorms, fetchCyclogenesisWatch } from '../api/historical.api';

export const useHistoricalData = (filters) => {
  const historicalQuery = useQuery({
    queryKey: ['historicalStorms', filters],
    queryFn: () => fetchHistoricalStorms(filters),
  });

  return {
    storms: historicalQuery.data || [],
    isLoading: historicalQuery.isLoading,
    isError: historicalQuery.isError,
  };
};

export const useCyclogenesisWatch = () => {
  const watchQuery = useQuery({
    queryKey: ['cyclogenesisWatch'],
    queryFn: fetchCyclogenesisWatch,
  });

  return {
    disturbances: watchQuery.data || [],
    isLoading: watchQuery.isLoading,
    isError: watchQuery.isError,
  };
};
