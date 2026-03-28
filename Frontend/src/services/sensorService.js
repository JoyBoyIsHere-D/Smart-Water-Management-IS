/**
 * Sensor API Service
 * Handles all sensor data API calls
 */

import { API_URL } from '../config/api';

/**
 * Submit a sensor reading from IoT device
 */
export const submitSensorReading = async (data) => {
  const response = await fetch(`${API_URL}/api/sensors/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to submit reading');
  }

  return response.json();
};

/**
 * Get sensor readings for a user
 */
export const getSensorReadings = async (uniqueId, limit = 100, offset = 0) => {
  const response = await fetch(
    `${API_URL}/api/sensors/readings/${uniqueId}?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch readings');
  }

  return response.json();
};

/**
 * Get the latest sensor reading for a user
 */
export const getLatestReading = async (uniqueId) => {
  const response = await fetch(
    `${API_URL}/api/sensors/readings/${uniqueId}/latest`
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch latest reading');
  }

  return response.json();
};

/**
 * Get sensor statistics for a user
 */
export const getSensorStatistics = async (uniqueId) => {
  const response = await fetch(
    `${API_URL}/api/sensors/readings/${uniqueId}/statistics`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch statistics');
  }

  return response.json();
};

/**
 * Get sensor readings within a date range
 */
export const getSensorReadingsInRange = async (uniqueId, startDate, endDate) => {
  const response = await fetch(
    `${API_URL}/api/sensors/readings/${uniqueId}/range?start_date=${startDate}&end_date=${endDate}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch readings');
  }

  return response.json();
};

/**
 * Get all users' latest readings (admin dashboard)
 */
export const getAllUsersLatestReadings = async () => {
  const response = await fetch(`${API_URL}/api/sensors/dashboard/all-users`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch dashboard data');
  }

  return response.json();
};

/**
 * Transform API reading to frontend format
 */
export const transformReading = (reading) => {
  return {
    id: reading.id,
    time: new Date(reading.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    timestamp: reading.timestamp,
    pH: reading.ph,
    tds: reading.tds,
    temperature: reading.temperature,
    flowRate: reading.flow_rate,
    pressure: reading.pressure,
    totalVolume: reading.total_volume_passed,
    dissolvedOxygen: reading.dissolved_oxygen,
    waterQuality: reading.water_quality,
    riskLevel: reading.risk_level,
    deviceId: reading.device_id,
    location: reading.location
  };
};

/**
 * Transform multiple API readings to frontend format
 */
export const transformReadings = (readings) => {
  return readings.map(transformReading);
};
