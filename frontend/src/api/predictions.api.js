import axiosClient from './axiosClient';
import { MOCK_ACTIVE_CYCLONES } from './mockData';

export const fetchPredictionTrack = async (cycloneId) => {
  try {
    const res = await axiosClient.get(`/predictions/${cycloneId}/track`);
    const trackData = res.data?.data ?? res.data;
    if (trackData && (trackData.predictedTrack || trackData.historicalTrack)) {
      return trackData;
    }
    const storm = MOCK_ACTIVE_CYCLONES.find((c) => c.id === cycloneId) || MOCK_ACTIVE_CYCLONES[0];
    return {
      cycloneId: storm.id,
      historicalTrack: storm.historicalTrack,
      predictedTrack: storm.predictedTrack,
      source: storm.source,
      confidenceScore: storm.confidenceScore,
    };
  } catch (err) {
    const storm = MOCK_ACTIVE_CYCLONES.find((c) => c.id === cycloneId) || MOCK_ACTIVE_CYCLONES[0];
    return {
      cycloneId: storm.id,
      historicalTrack: storm.historicalTrack,
      predictedTrack: storm.predictedTrack,
      source: storm.source,
      confidenceScore: storm.confidenceScore,
    };
  }
};

export const triggerPredictionRefresh = async (cycloneId) => {
  try {
    const res = await axiosClient.post(`/predictions/${cycloneId}/refresh`);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.warn('[predictions.api] Refresh call error:', err.message);
    throw err;
  }
};
