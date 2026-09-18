import axiosClient from './axiosClient';
import { MOCK_HISTORICAL_STORMS, MOCK_CYCLOGENESIS_WATCH } from './mockData';

export const fetchHistoricalStorms = async (filters = {}) => {
  try {
    const res = await axiosClient.get('/cyclones/historical', { params: filters });
    const list = res.data?.data ?? res.data;
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
    let filtered = [...MOCK_HISTORICAL_STORMS];
    if (filters.basin && filters.basin !== 'All') {
      filtered = filtered.filter((s) => s.basin === filters.basin);
    }
    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter((s) => s.peakCategory === filters.category);
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(q) || s.year?.toString().includes(q));
    }
    return filtered;
  } catch (err) {
    let filtered = [...MOCK_HISTORICAL_STORMS];
    if (filters.basin && filters.basin !== 'All') {
      filtered = filtered.filter((s) => s.basin === filters.basin);
    }
    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter((s) => s.peakCategory === filters.category);
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(q) || s.year?.toString().includes(q));
    }
    return filtered;
  }
};

export const fetchCyclogenesisWatch = async () => {
  try {
    const res = await axiosClient.get('/cyclogenesis/watch');
    const disturbances = res.data?.disturbances ?? res.data?.data ?? res.data;
    if (Array.isArray(disturbances) && disturbances.length > 0) {
      return disturbances;
    }
    return MOCK_CYCLOGENESIS_WATCH;
  } catch (err) {
    return MOCK_CYCLOGENESIS_WATCH;
  }
};
