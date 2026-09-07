import { useQuery } from '@tanstack/react-query';
import { fetchCycloneDetail } from '../api/cyclones.api';
import { fetchPredictionTrack } from '../api/predictions.api';

export const useCycloneDetail = (cycloneId) => {
  const detailQuery = useQuery({
    queryKey: ['cycloneDetail', cycloneId],
    queryFn: () => fetchCycloneDetail(cycloneId),
    enabled: !!cycloneId,
  });

  const predictionQuery = useQuery({
    queryKey: ['predictionTrack', cycloneId],
    queryFn: () => fetchPredictionTrack(cycloneId),
    enabled: !!cycloneId,
  });

  return {
    cyclone: detailQuery.data,
    prediction: predictionQuery.data,
    isLoading: detailQuery.isLoading || predictionQuery.isLoading,
    isError: detailQuery.isError || predictionQuery.isError,
    refetch: () => {
      detailQuery.refetch();
      predictionQuery.refetch();
    },
  };
};
