/**
 * Dummy water-sensor data for each portal user and the admin master view.
 * In production this will come from an API; for now we hard-code it.
 */

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
      turbidity: +(1.5 + Math.cos(s) * 1.2 + Math.random() * 0.5).toFixed(2),
      tds: Math.floor(220 + Math.sin(s * 0.7) * 80 + Math.random() * 30),
      temperature: +(22 + Math.sin(s * 0.3) * 4 + Math.random() * 1).toFixed(1),
      flowRate: +(55 + Math.cos(s * 0.5) * 20 + Math.random() * 5).toFixed(1),
      dissolvedOxygen: +(7 + Math.sin(s * 0.4) * 1.5 + Math.random() * 0.3).toFixed(2),
      consumption: +(12 + Math.sin(s * 0.6) * 5 + Math.random() * 2).toFixed(1),
    });
  }
  return data;
}

// ── Portal users (mirrors what admin registered) ────────────────────────────
export const DUMMY_USERS = [
  {
    id: '1',
    unique_id: 'WU-2024-001',
    full_name: 'Rajesh Kumar',
    area: 'Sector 14, Gurgaon',
    email: 'rajesh@example.com',
    phone: '+91-9876543210',
  },
  {
    id: '2',
    unique_id: 'WU-2024-002',
    full_name: 'Priya Sharma',
    area: 'MG Road, Bengaluru',
    email: 'priya@example.com',
    phone: '+91-9123456789',
  },
  {
    id: '3',
    unique_id: 'WU-2024-003',
    full_name: 'Amit Patel',
    area: 'Andheri West, Mumbai',
    email: 'amit@example.com',
    phone: '+91-9988776655',
  },
  {
    id: '4',
    unique_id: 'WU-2024-004',
    full_name: 'Sneha Reddy',
    area: 'Banjara Hills, Hyderabad',
    email: 'sneha@example.com',
    phone: '+91-8877665544',
  },
  {
    id: '5',
    unique_id: 'WU-2024-005',
    full_name: 'Vikram Singh',
    area: 'Civil Lines, Jaipur',
    email: 'vikram@example.com',
    phone: '+91-7766554433',
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
        type: idx % 2 === 0 ? 'High Turbidity' : 'pH Deviation',
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
  const avgTurbidity = +(all.reduce((s, d) => s + Number(d.latest.turbidity), 0) / all.length).toFixed(2);
  const avgTemp = +(all.reduce((s, d) => s + Number(d.latest.temperature), 0) / all.length).toFixed(1);

  // Per-user summary rows for the master table
  const userSummaries = all.map((d) => ({
    unique_id: d.user.unique_id,
    name: d.user.full_name,
    area: d.user.area,
    healthIndex: d.healthIndex,
    pH: d.latest.pH,
    turbidity: d.latest.turbidity,
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
      combinedSeries[i][`${d.user.unique_id}_turbidity`] = pt.turbidity;
      combinedSeries[i][`${d.user.unique_id}_consumption`] = pt.consumption;
    });
  });

  return {
    totalUsers: all.length,
    avgHealth,
    totalConsumption,
    totalAnomalies,
    avgPh,
    avgTurbidity,
    avgTemp,
    userSummaries,
    combinedSeries,
  };
}

// ── Look up a user's data by unique_id (fallback-safe) ─────────────────────
export function getUserData(uniqueId) {
  return USER_SENSOR_DATA[uniqueId] || USER_SENSOR_DATA[DUMMY_USERS[0].unique_id];
}
