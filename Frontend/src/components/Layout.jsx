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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Close sidebar on mobile when route changes or clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header */}
        <Header
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Page Content - Rendered by React Router */}
        <Outlet context={{ sensorData, healthIndex, sidebarOpen, handleRefresh, setSensorData }} />
      </main>
    </div>
  );
}
