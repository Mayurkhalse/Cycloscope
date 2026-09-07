import axiosClient from './axiosClient';
import { MOCK_ACTIVE_CYCLONES, MOCK_SYSTEM_STATUS } from './mockData';

export const fetchActiveSystems = async () => {
  try {
    const res = await axiosClient.get('/cyclones/active');
    return res.data;
  } catch (err) {
    return MOCK_ACTIVE_CYCLONES;
  }
};

export const fetchCycloneDetail = async (cycloneId) => {
  try {
    const res = await axiosClient.get(`/cyclones/${cycloneId}`);
    return res.data;
  } catch (err) {
    const item = MOCK_ACTIVE_CYCLONES.find((c) => c.id === cycloneId);
    return item || MOCK_ACTIVE_CYCLONES[0];
  }
};

export const fetchSystemStatus = async () => {
  try {
    const res = await axiosClient.get('/system/ml-status');
    return res.data;
  } catch (err) {
    return MOCK_SYSTEM_STATUS;
  }
};
