import { useState, useEffect } from 'react';
import { Beaker, Thermometer, Gauge, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import {
  Sidebar,
  Header,
  HealthIndexCard,
  MetricCard,
  SensorChart,
  QualityPieChart,
  FlowDistributionChart,
  AnomalyAlerts,
  DataUpload,
  MetricsGrid
} from './ui';
import Analytics from './pages/Analytics';

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

export default function Dashboard() {
  const [sensorData, setSensorData] = useState(generateTimeSeriesData());
  const [healthIndex, setHealthIndex] = useState(78);
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
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

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setSensorData(generateTimeSeriesData());
    }, 2000);
  };

  const latestData = sensorData[sensorData.length - 1] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <Header lastUpdated={lastUpdated} onRefresh={handleRefresh} />

        {/* Conditional Page Rendering */}
        {activeTab === 'analytics' ? (
          <Analytics sidebarOpen={sidebarOpen} />
        ) : (
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HealthIndexCard healthIndex={healthIndex} />

            <MetricCard
              title="pH Level"
              value={latestData.pH}
              icon={Beaker}
              iconGradient="from-purple-500 to-purple-600"
              trend={{ icon: TrendingUp, color: 'text-emerald-400', text: 'Normal range' }}
            />

            <MetricCard
              title="Temperature"
              value={latestData.temperature}
              unit="°C"
              icon={Thermometer}
              iconGradient="from-orange-500 to-red-500"
              trend={{ icon: TrendingDown, color: 'text-cyan-400', text: '-0.5°C from avg' }}
            />

            <MetricCard
              title="Flow Rate"
              value={latestData.flowRate}
              unit="L/min"
              icon={Gauge}
              iconGradient="from-cyan-500 to-blue-500"
              trend={{ icon: Zap, color: 'text-amber-400', text: 'Peak usage' }}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SensorChart data={sensorData} />
            <QualityPieChart />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FlowDistributionChart />
            <AnomalyAlerts />
            <DataUpload isUploading={isUploading} onFileUpload={handleFileUpload} />
          </div>

          {/* Additional Metrics */}
          <MetricsGrid sensorData={sensorData} />
        </div>
        )}
      </main>
    </div>
  );
}
