/**
 * Water-sensor data for each portal user and the admin master view.
 * Provides both API integration and fallback dummy data.
 */

import { API_URL } from '../config/api';

// ── Helper: generate 24-h time-series for one user ──────────────────────────
function makeTimeSeries(seed) {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now - i * 3600000);
    const s = seed + i; // deterministic-ish variation per user
    data.push({
      time: t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      pH: +(6.5 + Math.sin(s) * 0.8 + Math.random() * 0.3).toFixed(2),
      flowRate: +(55 + Math.cos(s * 0.5) * 20 + Math.random() * 5).toFixed(1),
      tds: Math.floor(220 + Math.sin(s * 0.7) * 80 + Math.random() * 30),
      temperature: +(22 + Math.sin(s * 0.3) * 4 + Math.random() * 1).toFixed(1),
      dissolvedOxygen: +(7 + Math.sin(s * 0.4) * 1.5 + Math.random() * 0.3).toFixed(2),
      consumption: +(12 + Math.sin(s * 0.6) * 5 + Math.random() * 2).toFixed(1),
    });
  }
  return data;
}

// ── Portal users (fallback if API unavailable) ────────────────────────────
export const DUMMY_USERS = [
  {
    id: '1',
    unique_id: 'WU-2024-001',
    full_name: 'Rajesh Kumar',
    area: 'Sector 14, Gurgaon',
    email: 'rajesh.kumar@email.com',
    phone: '+91-9876543210',
  },
  {
    id: '2',
    unique_id: 'WU-2024-002',
    full_name: 'Priya Sharma',
    area: 'Connaught Place, New Delhi',
    email: 'priya.sharma@email.com',
    phone: '+91-9876543211',
  },
  {
    id: '3',
    unique_id: 'WU-2024-003',
    full_name: 'Amit Patel',
    area: 'Bandra West, Mumbai',
    email: 'amit.patel@email.com',
    phone: '+91-9876543212',
  },
];

// ── Per-user sensor data, anomalies, health index ──────────────────────────
export const USER_SENSOR_DATA = {};

DUMMY_USERS.forEach((u, idx) => {
  const series = makeTimeSeries((idx + 1) * 7);
  const latest = series[series.length - 1];
  const healthIndex = Math.floor(65 + Math.random() * 30);

  USER_SENSOR_DATA[u.unique_id] = {
    user: u,
    series,
    latest,
    healthIndex,
    qualityBreakdown: {
      excellent: Math.floor(30 + Math.random() * 40),
      good: Math.floor(20 + Math.random() * 25),
      fair: Math.floor(5 + Math.random() * 15),
      poor: Math.floor(2 + Math.random() * 8),
    },
    anomalies: [
      {
        id: `${u.unique_id}-a1`,
        type: idx % 2 === 0 ? 'High Flow Rate' : 'pH Deviation',
        sensor: `Sensor #${idx * 3 + 1}`,
        time: `${Math.floor(Math.random() * 59) + 1} min ago`,
        severity: ['high', 'medium', 'low'][idx % 3],
      },
      {
        id: `${u.unique_id}-a2`,
        type: 'Flow Rate Drop',
        sensor: `Sensor #${idx * 3 + 2}`,
        time: `${Math.floor(1 + Math.random() * 4)} hours ago`,
        severity: 'low',
      },
    ],
    monthlyConsumption: +(3200 + Math.random() * 1800).toFixed(0),
    dailyAvgConsumption: +(120 + Math.random() * 80).toFixed(1),
  };
});

// ── Aggregated master-dashboard data for admin ──────────────────────────────
export function getMasterDashboard() {
  const all = Object.values(USER_SENSOR_DATA);

  const avgHealth = Math.round(all.reduce((s, d) => s + d.healthIndex, 0) / all.length);
  const totalConsumption = all.reduce((s, d) => s + Number(d.monthlyConsumption), 0);
  const totalAnomalies = all.reduce((s, d) => s + d.anomalies.length, 0);
  const avgPh = +(all.reduce((s, d) => s + Number(d.latest.pH), 0) / all.length).toFixed(2);
  const avgFlowRate = +(all.reduce((s, d) => s + Number(d.latest.flowRate), 0) / all.length).toFixed(2);
  const avgTemp = +(all.reduce((s, d) => s + Number(d.latest.temperature), 0) / all.length).toFixed(1);

  // Per-user summary rows for the master table
  const userSummaries = all.map((d) => ({
    unique_id: d.user.unique_id,
    name: d.user.full_name,
    area: d.user.area,
    healthIndex: d.healthIndex,
    pH: d.latest.pH,
    flowRate: d.latest.flowRate,
    consumption: d.monthlyConsumption,
    anomalies: d.anomalies.length,
  }));

  // Merge all time-series into one array tagged with user
  const combinedSeries = [];
  all.forEach((d) => {
    d.series.forEach((pt, i) => {
      if (!combinedSeries[i]) {
        combinedSeries[i] = { time: pt.time };
      }
      combinedSeries[i][`${d.user.unique_id}_pH`] = pt.pH;
      combinedSeries[i][`${d.user.unique_id}_flowRate`] = pt.flowRate;
      combinedSeries[i][`${d.user.unique_id}_consumption`] = pt.consumption;
    });
  });

  return {
    totalUsers: all.length,
    avgHealth,
    totalConsumption,
    totalAnomalies,
    avgPh,
    avgFlowRate,
    avgTemp,
    userSummaries,
    combinedSeries,
  };
}

// ── Look up a user's data by unique_id (fallback-safe) ─────────────────────
export function getUserData(uniqueId) {
  return USER_SENSOR_DATA[uniqueId] || USER_SENSOR_DATA[DUMMY_USERS[0].unique_id];
}

// ══════════════════════════════════════════════════════════════════════════
// API INTEGRATION FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

// Sample user IDs that can use dummy data as fallback
const SAMPLE_USER_IDS = ['WU-2024-001', 'WU-2024-002', 'WU-2024-003'];

// Sample admin email that can use dummy data as fallback
const SAMPLE_ADMIN_EMAIL = 'admin@waterwatch.com';

/**
 * Check if a user is a sample user (allowed to use dummy data)
 */
export function isSampleUser(uniqueId) {
  return SAMPLE_USER_IDS.includes(uniqueId);
}

/**
 * Check if an admin is a sample admin (allowed to use dummy data)
 */
export function isSampleAdmin(email) {
  return email === SAMPLE_ADMIN_EMAIL;
}

/**
 * Get empty data structure for users with no data
 */
export function getEmptyUserData(uniqueId, userInfo = null) {
  return {
    user: userInfo || {
      id: uniqueId,
      unique_id: uniqueId,
      full_name: 'User',
      area: 'Unknown Area',
      email: '',
      phone: ''
    },
    series: [],
    latest: null,
    healthIndex: 0,
    qualityBreakdown: {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
    },
    anomalies: [],
    monthlyConsumption: 0,
    dailyAvgConsumption: 0,
    noData: true
  };
}

/**
 * Get empty master dashboard structure
 */
export function getEmptyMasterDashboard() {
  return {
    totalUsers: 0,
    avgHealth: 0,
    totalConsumption: 0,
    totalAnomalies: 0,
    avgPh: 0,
    avgFlowRate: 0,
    avgTemp: 0,
    userSummaries: [],
    combinedSeries: [],
    noData: true
  };
}

/**
 * Fetch portal users from API (no fallback to dummy data)
 */
export async function fetchPortalUsers() {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/users`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const users = await response.json();
    return users.map(u => ({
      id: u.id,
      unique_id: u.unique_id,
      full_name: u.full_name,
      area: u.address || 'Unknown Area',
      email: u.email,
      phone: u.phone,
    }));
  } catch (err) {
    console.error('API fetch failed:', err);
    // Return empty array instead of dummy data
    return [];
  }
}

/**
 * Fetch sensor readings for a user from API
 */
export async function fetchUserSensorData(uniqueId) {
  try {
    const [readingsRes, statsRes] = await Promise.all([
      fetch(`${API_URL}/api/sensors/readings/${uniqueId}?limit=48`),
      fetch(`${API_URL}/api/sensors/readings/${uniqueId}/statistics`)
    ]);

    if (!readingsRes.ok || !statsRes.ok) {
      return null;
    }

    const readingsData = await readingsRes.json();
    const statsData = await statsRes.json();

    // If no readings, return null
    if (!readingsData.readings || readingsData.readings.length === 0) {
      return null;
    }

    // Transform API data to match frontend format
    const series = readingsData.readings.map(r => ({
      time: new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      pH: r.ph,
      flowRate: r.flow_rate,
      tds: r.tds,
      temperature: r.temperature,
      dissolvedOxygen: r.dissolved_oxygen,
      consumption: r.flow_rate * 0.2, // Estimate consumption from flow rate
      waterQuality: r.water_quality,
      riskLevel: r.risk_level
    })).reverse(); // API returns newest first

    const latest = series.length > 0 ? series[series.length - 1] : null;

    // Calculate health index from safe/unsafe ratio
    const safeCount = statsData.safe_count || 0;
    const unsafeCount = statsData.unsafe_count || 0;
    const totalCount = safeCount + unsafeCount;
    const healthIndex = totalCount > 0
      ? Math.round((safeCount / totalCount) * 100)
      : 0;

    // Generate anomalies based on readings with issues
    const anomalies = (readingsData.readings || [])
      .filter(r => r.water_quality === 'Unsafe')
      .slice(0, 5)
      .map((r, idx) => ({
        id: `${uniqueId}-a${idx}`,
        type: r.risk_level === 'High' ? 'Critical Quality Issue' :
              r.ph < 6.5 || r.ph > 8.5 ? 'pH Deviation' :
              r.tds > 500 ? 'High TDS' : 'Flow Rate Issue',
        sensor: r.device_id || `Sensor #${idx + 1}`,
        time: new Date(r.timestamp).toLocaleString(),
        severity: r.risk_level?.toLowerCase() || 'medium'
      }));

    // Handle NaN in quality breakdown
    const safeRatio = totalCount > 0 ? safeCount / totalCount : 0;
    const unsafeRatio = totalCount > 0 ? unsafeCount / totalCount : 0;

    return {
      series,
      latest,
      healthIndex,
      qualityBreakdown: {
        excellent: Math.floor(safeRatio * 40) || 0,
        good: Math.floor(safeRatio * 35) || 0,
        fair: Math.floor(unsafeRatio * 15) || 0,
        poor: Math.floor(unsafeRatio * 10) || 0,
      },
      anomalies,
      monthlyConsumption: Math.round((statsData.avg_flow_rate || 0) * 24 * 30),
      dailyAvgConsumption: Math.round((statsData.avg_flow_rate || 0) * 24),
      statistics: statsData
    };
  } catch (err) {
    console.error('API fetch failed:', err);
    return null;
  }
}

/**
 * Get user data with API - only fallback to dummy data for sample users
 */
export async function getUserDataWithAPI(uniqueId, userInfo = null) {
  // First try to get from API
  const apiData = await fetchUserSensorData(uniqueId);

  if (apiData && apiData.series.length > 0) {
    // Find user info from dummy users or use provided info
    const user = userInfo || DUMMY_USERS.find(u => u.unique_id === uniqueId) || {
      id: uniqueId,
      unique_id: uniqueId,
      full_name: 'User',
      area: 'Unknown Area'
    };

    return {
      user,
      ...apiData
    };
  }

  // Only fallback to dummy data for sample users
  if (isSampleUser(uniqueId)) {
    return getUserData(uniqueId);
  }

  // For non-sample users, return empty data
  return getEmptyUserData(uniqueId, userInfo);
}

/**
 * Fetch master dashboard data with API integration (dummy fallback only for sample admin)
 */
export async function getMasterDashboardWithAPI(adminUser = null) {
  try {
    // First fetch all portal users from database
    const token = localStorage.getItem('access_token');
    const usersResponse = await fetch(`${API_URL}/api/users`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    let portalUsers = [];
    if (usersResponse.ok) {
      portalUsers = await usersResponse.json();
    }

    // Fetch all users' latest readings
    const response = await fetch(`${API_URL}/api/sensors/dashboard/all-users`);

    if (!response.ok) {
      // No sensor data, but we still have users - return user count with no sensor data
      if (portalUsers.length > 0) {
        return {
          totalUsers: portalUsers.length,
          avgHealth: 0,
          totalConsumption: 0,
          totalAnomalies: 0,
          avgPh: 0,
          avgFlowRate: 0,
          avgTemp: 0,
          userSummaries: portalUsers.map(u => ({
            unique_id: u.unique_id,
            name: u.full_name,
            area: u.address || 'Unknown',
            healthIndex: 0,
            pH: 0,
            flowRate: 0,
            consumption: 0,
            anomalies: 0,
            noData: true
          })),
          combinedSeries: [],
          noData: true
        };
      }

      // If no users from API and admin is sample admin, fallback to dummy data
      if (adminUser && isSampleAdmin(adminUser.email)) {
        return getMasterDashboard();
      }

      return getEmptyMasterDashboard();
    }

    const data = await response.json();

    if (data.users && data.users.length > 0) {
      // Create a map of user info from portal users
      const userMap = {};
      portalUsers.forEach(u => {
        userMap[u.unique_id] = u;
      });

      // Transform API data
      const userSummaries = data.users.map(u => {
        const userInfo = userMap[u.unique_id];
        return {
          unique_id: u.unique_id,
          name: userInfo?.full_name || u.unique_id,
          area: userInfo?.address || u.location || 'Unknown',
          healthIndex: u.water_quality === 'Safe' ? 85 : 45,
          pH: u.ph,
          flowRate: u.flow_rate,
          consumption: u.total_volume_passed || 0,
          anomalies: u.water_quality === 'Unsafe' ? 1 : 0
        };
      });

      const avgPh = data.users.reduce((s, u) => s + (u.ph || 0), 0) / data.users.length;
      const avgFlowRate = data.users.reduce((s, u) => s + (u.flow_rate || 0), 0) / data.users.length;
      const avgTemp = data.users.reduce((s, u) => s + (u.temperature || 0), 0) / data.users.length;

      return {
        totalUsers: Math.max(data.total_users, portalUsers.length),
        avgHealth: Math.round(userSummaries.reduce((s, u) => s + u.healthIndex, 0) / userSummaries.length),
        totalConsumption: userSummaries.reduce((s, u) => s + u.consumption, 0),
        totalAnomalies: userSummaries.reduce((s, u) => s + u.anomalies, 0),
        avgPh: +avgPh.toFixed(2),
        avgFlowRate: +avgFlowRate.toFixed(2),
        avgTemp: +avgTemp.toFixed(1),
        userSummaries,
        combinedSeries: []
      };
    }

    // No sensor readings but we have users
    if (portalUsers.length > 0) {
      return {
        totalUsers: portalUsers.length,
        avgHealth: 0,
        totalConsumption: 0,
        totalAnomalies: 0,
        avgPh: 0,
        avgFlowRate: 0,
        avgTemp: 0,
        userSummaries: portalUsers.map(u => ({
          unique_id: u.unique_id,
          name: u.full_name,
          area: u.address || 'Unknown',
          healthIndex: 0,
          pH: 0,
          flowRate: 0,
          consumption: 0,
          anomalies: 0,
          noData: true
        })),
        combinedSeries: [],
        noData: true
      };
    }

    return getEmptyMasterDashboard();
  } catch (err) {
    console.error('API fetch failed:', err);
    // Return dummy data for sample admin, empty dashboard for others
    if (adminUser && isSampleAdmin(adminUser.email)) {
      return getMasterDashboard();
    }
    return getEmptyMasterDashboard();
  }
}
