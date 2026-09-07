import axiosClient from './axiosClient';
import { MOCK_ACTIVE_CYCLONES } from './mockData';

export const fetchPredictionTrack = async (cycloneId) => {
  try {
    const res = await axiosClient.get(`/predictions/${cycloneId}/track`);
    return res.data;
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
