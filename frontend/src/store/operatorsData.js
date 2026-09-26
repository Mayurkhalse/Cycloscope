/**
 * Meteorological Workstation Operator Personas & Pre-configured RBAC Profiles
 * 
 * Provides detailed profiles for:
 *  - Operational Meteorologists (Dvorak EIR, Advisory issuance, Intensity calibration)
 *  - Cyclone Research Analysts (Ensemble statistics, Environmental parameters, NetCDF export)
 *  - Disaster Response Coordinators (NDMA Threat matrix, Landfall ETA, Evacuation zones)
 *  - Workstation Systems Administrators (Data ingestion pipelines, Telemetry monitoring)
 */

export const PRESET_OPERATOR_PERSONAS = [
  {
    id: 'op-met-01',
    username: 'meteorologist',
    passwords: ['meteo2026', 'password123', 'cyclone2026'],
    name: 'Dr. Rajesh Sen',
    role: 'meteorologist',
    roleTitle: 'Operational Meteorologist / Lead Forecaster',
    department: 'RSMC New Delhi / Cyclone Warning Division (IMD)',
    station: 'RSMC New Delhi HQ (Safdarjung)',
    callsign: 'RSMC-MET-01',
    clearanceLevel: 'LEVEL-3 (OPERATIONAL FORECASTER)',
    avatarInitials: 'RS',
    badgeColor: 'emerald',
    themeGradient: 'from-emerald-600 to-teal-700',
    capabilities: [
      'Satellite Dvorak EIR Analysis',
      'Cone of Uncertainty Calibration',
      'Official RSMC Advisory Issuance',
      'Intensity Forecast Adjustment',
      'Coastal Warning Bulletins'
    ],
    roleSummary: 'Authorized to interpret satellite fixes, calibrate intensity predictions, adjust cones of uncertainty, and issue official RSMC warnings.'
  },
  {
    id: 'op-sci-04',
    username: 'analyst',
    passwords: ['analyst2026', 'password123', 'science2026'],
    name: 'Dr. Priya Menon',
    role: 'analyst',
    roleTitle: 'Cyclone Research Analyst & Atmospheric Scientist',
    department: 'INCOIS / Tropical Ocean-Atmosphere Dynamics Lab',
    station: 'INCOIS Ocean Valley, Hyderabad',
    callsign: 'INCOIS-SCI-04',
    clearanceLevel: 'LEVEL-2 (SCIENTIFIC RESEARCH)',
    avatarInitials: 'PM',
    badgeColor: 'sky',
    themeGradient: 'from-sky-600 to-cyan-700',
    capabilities: [
      'Ensemble Variance Diagnostics',
      'Environmental SST & Shear Matrix',
      'IBTrACS Analog Historical Matching',
      'Scientific NetCDF & CSV Export',
      'Model Validation & Bias Audit'
    ],
    roleSummary: 'Authorized to examine multi-model ensemble spread, environmental SST/shear diagnostics, audit historical analogs, and export scientific datasets.'
  },
  {
    id: 'op-ndma-09',
    username: 'coordinator',
    passwords: ['ndma2026', 'password123', 'relief2026'],
    name: 'Shri Vikram Rathore',
    role: 'coordinator',
    roleTitle: 'Disaster Management Coordinator / NDMA Liaison',
    department: 'National Disaster Management Authority (NDMA)',
    station: 'Central Emergency Operations Centre (EOC), New Delhi',
    callsign: 'NDMA-OPS-09',
    clearanceLevel: 'LEVEL-3 (DISASTER RESPONSE)',
    avatarInitials: 'VR',
    badgeColor: 'amber',
    themeGradient: 'from-amber-600 to-orange-700',
    capabilities: [
      'Landfall ETA & Coastal Impact Matrix',
      'District Wind Swath & Surge Risk',
      'Population Exposure Estimation',
      'Evacuation Readiness Dispatch',
      'Multi-Agency SitRep Synchronization'
    ],
    roleSummary: 'Authorized to review coastal inundation threats, district impact swathes, coordinate evacuation timelines, and dispatch inter-agency SitReps.'
  },
  {
    id: 'op-root-00',
    username: 'admin',
    passwords: ['admin2026', 'password123', 'root2026'],
    name: 'Er. Ananya Sharma',
    role: 'admin',
    roleTitle: 'Workstation Systems Administrator',
    department: 'Cyclone Telemetry & IT Infrastructure Division',
    station: 'National Data Center, Pune',
    callsign: 'SYS-ROOT-00',
    clearanceLevel: 'LEVEL-4 (INFRASTRUCTURE ROOT)',
    avatarInitials: 'AS',
    badgeColor: 'indigo',
    themeGradient: 'from-indigo-600 to-purple-700',
    capabilities: [
      'Data Ingestion Pipeline Control',
      'Satellite & Buoy Telemetry Health',
      'User Clearance & Role Management',
      'Model Inference Microservice Audit',
      'System Configuration & Backup'
    ],
    roleSummary: 'Full administrative clearance over telemetry ingest workers, ML model inference servers, access audit logs, and security token policies.'
  }
];

export const REGIONAL_CENTERS = [
  { id: 'rsmc-delhi', name: 'RSMC New Delhi HQ (Cyclone Warning Division)', domain: 'North Indian Ocean / Bay of Bengal & Arabian Sea' },
  { id: 'incois-hyd', name: 'INCOIS Hyderabad (Ocean State & Numerical Modeling)', domain: 'Marine Weather & Storm Surge Analysis' },
  { id: 'imd-pune', name: 'IMD Pune (Climate Research & National Data Center)', domain: 'Historical Climatology & Numerical Processing' },
  { id: 'ndma-delhi', name: 'NDMA EOC New Delhi (Emergency Operations Center)', domain: 'Disaster Relief Coordination & Public Safety' },
];
