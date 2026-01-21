import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, Header } from './ui';

// Mock data generator for demonstration
const generateTimeSeriesData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now - i * 3600000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      pH: (6.5 + Math.random() * 1.5).toFixed(2),
      turbidity: (1 + Math.random() * 4).toFixed(2),
      tds: Math.floor(200 + Math.random() * 300),
      temperature: (20 + Math.random() * 10).toFixed(1),
      flowRate: (50 + Math.random() * 50).toFixed(1),
      dissolvedOxygen: (6 + Math.random() * 3).toFixed(2),
    });
  }
  return data;
};

export default function Layout() {
  const [sensorData, setSensorData] = useState(generateTimeSeriesData());
  const [healthIndex, setHealthIndex] = useState(78);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(generateTimeSeriesData());
      setHealthIndex(70 + Math.floor(Math.random() * 20));
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setSensorData(generateTimeSeriesData());
    setHealthIndex(70 + Math.floor(Math.random() * 20));
    setLastUpdated(new Date());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <Header lastUpdated={lastUpdated} onRefresh={handleRefresh} />

        {/* Page Content - Rendered by React Router */}
        <Outlet context={{ sensorData, healthIndex, sidebarOpen, handleRefresh, setSensorData }} />
      </main>
    </div>
  );
}
