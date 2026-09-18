import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCycloneDetail } from '../api/cyclones.api';
import { fetchPredictionTrack, triggerPredictionRefresh } from '../api/predictions.api';

export const useCycloneDetail = (cycloneId) => {
  const queryClient = useQueryClient();

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

  const refreshMutation = useMutation({
    mutationFn: () => triggerPredictionRefresh(cycloneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycloneDetail', cycloneId] });
      queryClient.invalidateQueries({ queryKey: ['predictionTrack', cycloneId] });
      queryClient.invalidateQueries({ queryKey: ['activeSystems'] });
    },
  });

  return {
    cyclone: detailQuery.data,
    prediction: predictionQuery.data,
    isLoading: detailQuery.isLoading || predictionQuery.isLoading,
    isError: detailQuery.isError || predictionQuery.isError,
    isRefreshing: refreshMutation.isPending,
    refreshPrediction: refreshMutation.mutateAsync,
    refetch: () => {
      detailQuery.refetch();
      predictionQuery.refetch();
    },
  };
};
