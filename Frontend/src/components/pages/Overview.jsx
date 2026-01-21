import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Beaker, Thermometer, Gauge, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import {
  HealthIndexCard,
  MetricCard,
  SensorChart,
  QualityPieChart,
  FlowDistributionChart,
  AnomalyAlerts,
  DataUpload,
  MetricsGrid
} from '../ui';

export default function Overview() {
  const { sensorData, healthIndex, setSensorData } = useOutletContext();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };

  const latestData = sensorData[sensorData.length - 1] || {};

  return (
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
  );
}
