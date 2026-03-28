/**
 * Custom hooks for sensor data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSensorReadings,
  getLatestReading,
  getSensorStatistics,
  transformReadings,
  transformReading
} from '../services/sensorService';

// Sample user IDs that can use dummy data as fallback
const SAMPLE_USER_IDS = ['WU-2024-001', 'WU-2024-002', 'WU-2024-003'];

/**
 * Check if a user is a sample user (allowed to use dummy data)
 */
const isSampleUser = (uniqueId) => SAMPLE_USER_IDS.includes(uniqueId);

/**
 * Hook to fetch sensor readings with polling
 */
export const useSensorData = (uniqueId, refreshInterval = 30000) => {
  const [readings, setReadings] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noData, setNoData] = useState(false);

  const fetchData = useCallback(async () => {
    if (!uniqueId) {
      setLoading(false);
      setNoData(true);
      return;
    }

    try {
      const [readingsRes, latestRes] = await Promise.all([
        getSensorReadings(uniqueId, 48),
        getLatestReading(uniqueId)
      ]);

      const transformedReadings = transformReadings(readingsRes.readings || []);
      setReadings(transformedReadings);
      setLatest(latestRes ? transformReading(latestRes) : null);
      setNoData(transformedReadings.length === 0);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch sensor data:', err);
      setError(err.message);
      setReadings([]);
      setLatest(null);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  }, [uniqueId]);

  useEffect(() => {
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  return { readings, latest, loading, error, noData, refresh };
};

/**
 * Hook to fetch sensor statistics
 */
export const useSensorStatistics = (uniqueId) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uniqueId) {
      setLoading(false);
      return;
    }

    const fetchStatistics = async () => {
      try {
        const stats = await getSensorStatistics(uniqueId);
        setStatistics(stats);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [uniqueId]);

  return { statistics, loading, error };
};

/**
 * Generate fallback dummy data when API is unavailable (only for sample users)
 */
export const generateDummyReadings = (count = 24) => {
  const data = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * 3600000);
    data.push({
      id: `dummy-${i}`,
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: time.toISOString(),
      pH: parseFloat((6.5 + Math.random() * 1.5).toFixed(2)),
      tds: Math.floor(200 + Math.random() * 300),
      temperature: parseFloat((20 + Math.random() * 10).toFixed(1)),
      flowRate: parseFloat((50 + Math.random() * 50).toFixed(1)),
      pressure: parseFloat((1.5 + Math.random() * 2.5).toFixed(2)),
      totalVolume: parseFloat((1000 + Math.random() * 4000).toFixed(1)),
      dissolvedOxygen: parseFloat((6 + Math.random() * 3).toFixed(2)),
      waterQuality: Math.random() > 0.2 ? 'Safe' : 'Unsafe',
      riskLevel: Math.random() > 0.2 ? 'Low' : Math.random() > 0.5 ? 'Medium' : 'High'
    });
  }

  return data;
};

/**
 * Hook that provides sensor data with fallback to dummy data ONLY for sample users
 */
export const useSensorDataWithFallback = (uniqueId, refreshInterval = 30000) => {
  const [readings, setReadings] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [noData, setNoData] = useState(false);

  const fetchData = useCallback(async () => {
    if (!uniqueId) {
      setLoading(false);
      setNoData(true);
      setReadings([]);
      setLatest(null);
      return;
    }

    try {
      const [readingsRes, latestRes] = await Promise.all([
        getSensorReadings(uniqueId, 48),
        getLatestReading(uniqueId)
      ]);

      const transformedReadings = transformReadings(readingsRes.readings || []);

      if (transformedReadings.length === 0) {
        // No data in database - only use dummy data for sample users
        if (isSampleUser(uniqueId)) {
          const dummyData = generateDummyReadings(24);
          setReadings(dummyData);
          setLatest(dummyData[dummyData.length - 1]);
          setUsingFallback(true);
          setNoData(false);
        } else {
          // Non-sample user with no data - show empty state
          setReadings([]);
          setLatest(null);
          setUsingFallback(false);
          setNoData(true);
        }
      } else {
        setReadings(transformedReadings);
        setLatest(latestRes ? transformReading(latestRes) : transformedReadings[0]);
        setUsingFallback(false);
        setNoData(false);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch sensor data:', err);

      // Only use fallback for sample users
      if (isSampleUser(uniqueId)) {
        const dummyData = generateDummyReadings(24);
        setReadings(dummyData);
        setLatest(dummyData[dummyData.length - 1]);
        setUsingFallback(true);
        setNoData(false);
      } else {
        setReadings([]);
        setLatest(null);
        setUsingFallback(false);
        setNoData(true);
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [uniqueId]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  return { readings, latest, loading, error, usingFallback, noData, refresh };
};
