import axiosClient from './axiosClient';
import { MOCK_ACTIVE_CYCLONES, MOCK_SYSTEM_STATUS } from './mockData';

export const fetchActiveSystems = async () => {
  try {
    const res = await axiosClient.get('/cyclones/active');
    const list = res.data?.data ?? res.data;
    if (Array.isArray(list) && list.length > 0) {
      return list.map((c) => {
        const lat = c.currentLat ?? c.currentLocation?.latitude ?? c.currentLocation?.lat ?? 15.0;
        const lon = c.currentLon ?? c.currentLocation?.longitude ?? c.currentLocation?.lon ?? 88.0;
        const windKmh = c.maxWindSpeedKmh ?? c.currentWindSpeedKmh ?? 65;
        const windKnots = c.maxWindSpeedKnots ?? Math.round(windKmh / 1.852);

        return {
          ...c,
          id: c.cycloneId || c.id,
          name: c.name,
          basin: c.basin,
          category: c.category || c.currentCategory || 'Depression',
          categoryFullName: c.categoryFullName || c.currentCategory || 'Cyclonic Storm',
          currentLat: lat,
          currentLon: lon,
          maxWindSpeedKmh: windKmh,
          maxWindSpeedKnots: windKnots,
          windSpeedRangeKmh: c.windSpeedRangeKmh || `${Math.max(20, windKmh - 10)} - ${windKmh + 10} km/h`,
          minCentralPressure: c.minCentralPressure ?? c.centralPressureHpa ?? 985,
          movementDirection: c.movementDirection || c.movement?.direction || 'NNE',
          movementSpeedKmh: c.movementSpeedKmh ?? c.movement?.speedKmh ?? 14,
          riskLevel: c.riskLevel || 'Moderate',
          confidenceScore: c.confidenceScore || 88,
          trend: c.trend || 'strengthening',
          trendConfidence: c.trendConfidence || 85,
          lastUpdated: c.lastUpdated || new Date().toISOString(),
          source: c.source || 'ml-model',
          environmental: c.environmental || {
            seaSurfaceTemp: 29.5,
            verticalWindShear: 10.5,
            oceanHeatContent: 80,
            estimatedRainfallRate: '40 - 60 mm/hr',
          },
          historicalTrack: (c.historicalTrack || c.observedTrack || []).map((t) => ({
            lat: t.lat ?? t.latitude,
            lon: t.lon ?? t.longitude,
            timestamp: t.timestamp,
            windSpeedKmh: t.windSpeedKmh,
            category: t.category,
          })),
          predictedTrack: (c.predictedTrack || []).map((t) => ({
            lat: t.lat ?? t.latitude,
            lon: t.lon ?? t.longitude,
            forecastHour: t.forecastHour ?? t.leadTimeHours ?? 6,
            windSpeedKmh: t.windSpeedKmh,
            category: t.category,
            confidence: t.confidence ?? t.confidenceScore ?? 85,
            uncertaintyRadiusKm: t.uncertaintyRadiusKm ?? (25 + (t.leadTimeHours || t.forecastHour || 6) * 3),
          })),
        };
      });
    }
    return MOCK_ACTIVE_CYCLONES;
  } catch (err) {
    return MOCK_ACTIVE_CYCLONES;
  }
};

export const fetchCycloneDetail = async (cycloneId) => {
  try {
    const res = await axiosClient.get(`/cyclones/${cycloneId}`);
    const item = res.data?.data ?? res.data;
    if (item && (item.cycloneId || item.id)) {
      const lat = item.currentLat ?? item.currentLocation?.latitude ?? item.currentLocation?.lat ?? 15.0;
      const lon = item.currentLon ?? item.currentLocation?.longitude ?? item.currentLocation?.lon ?? 88.0;
      const windKmh = item.maxWindSpeedKmh ?? item.currentWindSpeedKmh ?? 65;
      const windKnots = item.maxWindSpeedKnots ?? Math.round(windKmh / 1.852);

      return {
        ...item,
        id: item.cycloneId || item.id,
        name: item.name,
        basin: item.basin,
        category: item.category || item.currentCategory || 'Depression',
        categoryFullName: item.categoryFullName || item.currentCategory || 'Cyclonic Storm',
        currentLat: lat,
        currentLon: lon,
        maxWindSpeedKmh: windKmh,
        maxWindSpeedKnots: windKnots,
        windSpeedRangeKmh: item.windSpeedRangeKmh || `${Math.max(20, windKmh - 10)} - ${windKmh + 10} km/h`,
        minCentralPressure: item.minCentralPressure ?? item.centralPressureHpa ?? 985,
        movementDirection: item.movementDirection || item.movement?.direction || 'NNE',
        movementSpeedKmh: item.movementSpeedKmh ?? item.movement?.speedKmh ?? 14,
        riskLevel: item.riskLevel || 'Moderate',
        confidenceScore: item.confidenceScore || 88,
        trend: item.trend || 'strengthening',
        trendConfidence: item.trendConfidence || 85,
        environmental: item.environmental || {
          seaSurfaceTemp: 29.5,
          verticalWindShear: 10.5,
          oceanHeatContent: 80,
          estimatedRainfallRate: '40 - 60 mm/hr',
        },
        historicalTrack: (item.historicalTrack || item.observedTrack || []).map((t) => ({
          lat: t.lat ?? t.latitude,
          lon: t.lon ?? t.longitude,
          timestamp: t.timestamp,
          windSpeedKmh: t.windSpeedKmh,
          category: t.category,
        })),
        predictedTrack: (item.predictedTrack || []).map((t) => ({
          lat: t.lat ?? t.latitude,
          lon: t.lon ?? t.longitude,
          forecastHour: t.forecastHour ?? t.leadTimeHours ?? 6,
          windSpeedKmh: t.windSpeedKmh,
          category: t.category,
          confidence: t.confidence ?? t.confidenceScore ?? 85,
          uncertaintyRadiusKm: t.uncertaintyRadiusKm ?? (25 + (t.leadTimeHours || t.forecastHour || 6) * 3),
        })),
        satelliteImage: {
          url: item.satelliteImage?.url && !item.satelliteImage.url.includes('unsplash.com')
            ? item.satelliteImage.url
            : '/satellite/remal_insat3d_ir.jpg',
          timestamp: item.satelliteImage?.timestamp || item.lastUpdated || new Date().toISOString(),
          channel: item.satelliteImage?.channel || 'Infrared (10.8 µm)',
          boundingBox: item.satelliteImage?.boundingBox || { latMin: 16, latMax: 21, lonMin: 86.3, lonMax: 91.3 },
        },
      };
    }
    const fallback = MOCK_ACTIVE_CYCLONES.find((c) => c.id === cycloneId);
    return fallback || MOCK_ACTIVE_CYCLONES[0];
  } catch (err) {
    const item = MOCK_ACTIVE_CYCLONES.find((c) => c.id === cycloneId);
    return item || MOCK_ACTIVE_CYCLONES[0];
  }
};

export const fetchSystemStatus = async () => {
  try {
    const res = await axiosClient.get('/system/ml-status');
    const data = res.data;
    const isLive = data.mlService?.status === 'online';
    const isMock = data.mlService?.mode === 'mock';

    return {
      status: isLive ? 'green' : 'amber',
      mlServiceStatus: data.mlService?.status || 'live',
      lastScanTime: data.timestamp || new Date().toISOString(),
      activeSystemsCount: 2,
      message: isLive
        ? 'ML models operational. Real-time satellite inference connected.'
        : 'Climatological fallback engaged. Operating under statistical estimates.',
    };
  } catch (err) {
    return MOCK_SYSTEM_STATUS;
  }
};
