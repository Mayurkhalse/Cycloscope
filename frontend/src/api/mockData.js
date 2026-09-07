// Comprehensive realistic datasets for North Indian Ocean Cyclone Intelligence Dashboard

export const MOCK_SYSTEM_STATUS = {
  status: 'green', // 'green' | 'amber' | 'red'
  mlServiceStatus: 'live',
  lastScanTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  activeSystemsCount: 3,
  message: 'ML models operational. Real-time satellite inference connected.',
};

export const MOCK_ACTIVE_CYCLONES = [
  {
    id: 'cyclone-tej-2026',
    name: 'Tej',
    basin: 'Arabian Sea',
    category: 'VSCS', // Very Severe Cyclonic Storm
    categoryFullName: 'Very Severe Cyclonic Storm',
    riskLevel: 'Severe', // 'Low' | 'Moderate' | 'High' | 'Severe'
    currentLat: 14.8,
    currentLon: 56.4,
    minCentralPressure: 978, // hPa
    maxWindSpeedKnots: 85,
    maxWindSpeedKmh: 155,
    windSpeedRangeKmh: '150 - 165 km/h',
    movementDirection: 'WNW',
    movementSpeedKmh: 14,
    lastUpdated: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    source: 'ml-model', // 'ml-model' | 'fallback-climatology'
    confidenceScore: 92,
    trend: 'strengthening', // 'strengthening' | 'steady' | 'weakening'
    trendConfidence: 88,
    environmental: {
      seaSurfaceTemp: 29.8, // °C
      verticalWindShear: 8.5, // knots (low, favorable)
      oceanHeatContent: 85, // kJ/cm²
      estimatedRainfallRate: '45 - 65 mm/hr',
    },
    satelliteImage: {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      channel: 'Infrared (10.8 µm)',
      boundingBox: { latMin: 12.5, latMax: 17.0, lonMin: 54.0, lonMax: 59.0 },
    },
    historicalTrack: [
      { lat: 11.2, lon: 61.5, timestamp: '2026-09-05T00:00:00Z', windSpeedKmh: 55, category: 'Depression' },
      { lat: 12.4, lon: 59.8, timestamp: '2026-09-05T12:00:00Z', windSpeedKmh: 75, category: 'Deep Depression' },
      { lat: 13.5, lon: 58.2, timestamp: '2026-09-06T00:00:00Z', windSpeedKmh: 110, category: 'Cyclonic Storm' },
      { lat: 14.2, lon: 57.1, timestamp: '2026-09-06T12:00:00Z', windSpeedKmh: 135, category: 'Severe Cyclonic Storm' },
      { lat: 14.8, lon: 56.4, timestamp: '2026-09-07T00:00:00Z', windSpeedKmh: 155, category: 'Very Severe Cyclonic Storm' },
    ],
    predictedTrack: [
      { lat: 15.4, lon: 55.2, forecastHour: 6, windSpeedKmh: 165, category: 'VSCS', confidence: 91, uncertaintyRadiusKm: 25 },
      { lat: 16.1, lon: 54.0, forecastHour: 12, windSpeedKmh: 175, category: 'VSCS', confidence: 88, uncertaintyRadiusKm: 45 },
      { lat: 16.9, lon: 53.1, forecastHour: 24, windSpeedKmh: 160, category: 'VSCS', confidence: 82, uncertaintyRadiusKm: 85 },
      { lat: 17.8, lon: 52.3, forecastHour: 36, windSpeedKmh: 130, category: 'SCS', confidence: 75, uncertaintyRadiusKm: 130 },
      { lat: 18.5, lon: 51.7, forecastHour: 48, windSpeedKmh: 90, category: 'CS', confidence: 68, uncertaintyRadiusKm: 180 },
    ],
  },
  {
    id: 'cyclone-hamoon-2026',
    name: 'Hamoon',
    basin: 'Bay of Bengal',
    category: 'SCS', // Severe Cyclonic Storm
    categoryFullName: 'Severe Cyclonic Storm',
    riskLevel: 'High',
    currentLat: 18.2,
    currentLon: 89.5,
    minCentralPressure: 988,
    maxWindSpeedKnots: 65,
    maxWindSpeedKmh: 120,
    windSpeedRangeKmh: '115 - 125 km/h',
    movementDirection: 'NNE',
    movementSpeedKmh: 18,
    lastUpdated: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    source: 'ml-model',
    confidenceScore: 89,
    trend: 'steady',
    trendConfidence: 85,
    environmental: {
      seaSurfaceTemp: 29.1,
      verticalWindShear: 14.2,
      oceanHeatContent: 72,
      estimatedRainfallRate: '30 - 45 mm/hr',
    },
    satelliteImage: {
      url: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=800&q=80',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      channel: 'Water Vapor (6.9 µm)',
      boundingBox: { latMin: 16.5, latMax: 20.0, lonMin: 87.5, lonMax: 91.5 },
    },
    historicalTrack: [
      { lat: 14.5, lon: 87.0, timestamp: '2026-09-05T06:00:00Z', windSpeedKmh: 45, category: 'Depression' },
      { lat: 16.0, lon: 88.1, timestamp: '2026-09-06T06:00:00Z', windSpeedKmh: 85, category: 'Cyclonic Storm' },
      { lat: 18.2, lon: 89.5, timestamp: '2026-09-07T06:00:00Z', windSpeedKmh: 120, category: 'Severe Cyclonic Storm' },
    ],
    predictedTrack: [
      { lat: 19.5, lon: 90.4, forecastHour: 6, windSpeedKmh: 125, category: 'SCS', confidence: 89, uncertaintyRadiusKm: 30 },
      { lat: 21.0, lon: 91.2, forecastHour: 12, windSpeedKmh: 120, category: 'SCS', confidence: 85, uncertaintyRadiusKm: 55 },
      { lat: 22.4, lon: 91.8, forecastHour: 24, windSpeedKmh: 95, category: 'CS', confidence: 78, uncertaintyRadiusKm: 95 },
    ],
  },
  {
    id: 'depression-bob-05',
    name: 'BOB 05 (Depression)',
    basin: 'Bay of Bengal',
    category: 'DD',
    categoryFullName: 'Deep Depression',
    riskLevel: 'Moderate',
    currentLat: 11.5,
    currentLon: 83.2,
    minCentralPressure: 1000,
    maxWindSpeedKnots: 30,
    maxWindSpeedKmh: 55,
    windSpeedRangeKmh: '50 - 60 km/h',
    movementDirection: 'NW',
    movementSpeedKmh: 10,
    lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    source: 'fallback-climatology', // Used statistical fallback demo
    fallbackReason: 'satellite-ingestion-delay',
    confidenceScore: 71,
    trend: 'strengthening',
    trendConfidence: 68,
    environmental: {
      seaSurfaceTemp: 30.2,
      verticalWindShear: 11.0,
      oceanHeatContent: 90,
      estimatedRainfallRate: '20 - 35 mm/hr',
    },
    satelliteImage: {
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      channel: 'Visible (0.65 µm)',
      boundingBox: { latMin: 9.8, latMax: 13.0, lonMin: 81.5, lonMax: 85.0 },
    },
    historicalTrack: [
      { lat: 9.8, lon: 85.1, timestamp: '2026-09-06T12:00:00Z', windSpeedKmh: 35, category: 'Depression' },
      { lat: 11.5, lon: 83.2, timestamp: '2026-09-07T06:00:00Z', windSpeedKmh: 55, category: 'Deep Depression' },
    ],
    predictedTrack: [
      { lat: 12.4, lon: 82.1, forecastHour: 6, windSpeedKmh: 65, category: 'CS', confidence: 70, uncertaintyRadiusKm: 40 },
      { lat: 13.2, lon: 81.0, forecastHour: 12, windSpeedKmh: 80, category: 'CS', confidence: 64, uncertaintyRadiusKm: 75 },
    ],
  },
];

export const MOCK_HISTORICAL_STORMS = [
  {
    id: 'fani-2019',
    name: 'Fani',
    year: 2019,
    basin: 'Bay of Bengal',
    peakCategory: 'ESCS', // Extremely Severe Cyclonic Storm
    maxWindSpeedKmh: 215,
    minPressureHpa: 932,
    landfallLocation: 'Puri, Odisha',
    durationDays: 8,
    track: [
      { lat: 5.2, lon: 88.5, timestamp: '2019-04-26' },
      { lat: 8.4, lon: 86.9, timestamp: '2019-04-28' },
      { lat: 12.0, lon: 84.2, timestamp: '2019-04-30' },
      { lat: 16.5, lon: 84.8, timestamp: '2019-05-02' },
      { lat: 19.8, lon: 85.8, timestamp: '2019-05-03' }, // Landfall Puri
    ]
  },
  {
    id: 'amphan-2020',
    name: 'Amphan',
    year: 2020,
    basin: 'Bay of Bengal',
    peakCategory: 'SuCS', // Super Cyclonic Storm
    maxWindSpeedKmh: 260,
    minPressureHpa: 920,
    landfallLocation: 'Bakkhali, West Bengal',
    durationDays: 6,
    track: [
      { lat: 10.4, lon: 86.2, timestamp: '2020-05-16' },
      { lat: 13.5, lon: 86.4, timestamp: '2020-05-17' },
      { lat: 17.2, lon: 86.9, timestamp: '2020-05-18' },
      { lat: 21.7, lon: 88.3, timestamp: '2020-05-20' }, // Landfall WB
    ]
  },
  {
    id: 'tauktae-2021',
    name: 'Tauktae',
    year: 2021,
    basin: 'Arabian Sea',
    peakCategory: 'ESCS',
    maxWindSpeedKmh: 220,
    minPressureHpa: 950,
    landfallLocation: 'Una, Gujarat',
    durationDays: 6,
    track: [
      { lat: 10.5, lon: 73.0, timestamp: '2021-05-14' },
      { lat: 14.8, lon: 72.3, timestamp: '2021-05-15' },
      { lat: 18.5, lon: 71.5, timestamp: '2021-05-16' },
      { lat: 20.8, lon: 71.1, timestamp: '2021-05-17' }, // Landfall Gujarat
    ]
  },
  {
    id: 'biparjoy-2023',
    name: 'Biparjoy',
    year: 2023,
    basin: 'Arabian Sea',
    peakCategory: 'VSCS',
    maxWindSpeedKmh: 165,
    minPressureHpa: 966,
    landfallLocation: 'Jakhau Port, Gujarat',
    durationDays: 13,
    track: [
      { lat: 11.8, lon: 66.2, timestamp: '2023-06-06' },
      { lat: 15.0, lon: 66.3, timestamp: '2023-06-08' },
      { lat: 19.5, lon: 67.5, timestamp: '2023-06-11' },
      { lat: 23.2, lon: 68.6, timestamp: '2023-06-15' }, // Landfall Gujarat
    ]
  }
];

export const MOCK_CYCLOGENESIS_WATCH = [
  {
    id: 'dist-01',
    name: 'Low Pressure Area (BoB East)',
    basin: 'Bay of Bengal',
    formationProbability48h: 75,
    riskRating: 'High',
    currentLat: 10.2,
    currentLon: 92.8,
    reasons: [
      'Warm Sea Surface Temperature (30.4 °C)',
      'Low vertical wind shear (< 10 knots)',
      'Strong lower-level vorticity confluence'
    ],
    estimatedDevelopmentTime: '24 - 36 hours',
    projectedCategory: 'Cyclonic Storm'
  },
  {
    id: 'dist-02',
    name: 'Trough Axis (South Arabian Sea)',
    basin: 'Arabian Sea',
    formationProbability48h: 40,
    riskRating: 'Moderate',
    currentLat: 7.5,
    currentLon: 68.1,
    reasons: [
      'Moderate SST (28.9 °C)',
      'Increasing moisture advection from south-west monsoonal flow',
      'Moderate wind shear (16 knots) limiting rapid growth'
    ],
    estimatedDevelopmentTime: '48 - 72 hours',
    projectedCategory: 'Deep Depression'
  }
];

export const MOCK_CHATBOT_STARTERS = [
  "What is the current cyclone risk near Chennai and Odisha?",
  "Compare Cyclone Tej to Cyclone Fani in intensity and path.",
  "What is the 24-hour predicted track and uncertainty for Cyclone Tej?",
  "Is the statistical fallback currently active for any storm?"
];
