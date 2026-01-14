import { Droplets, Activity, Waves, Beaker } from 'lucide-react';

const metrics = [
  { label: 'TDS', key: 'tds', unit: 'ppm', icon: Droplets, color: 'from-blue-500 to-cyan-500' },
  { label: 'Dissolved Oxygen', key: 'dissolvedOxygen', unit: 'mg/L', icon: Waves, color: 'from-emerald-500 to-teal-500' },
  { label: 'Turbidity', key: 'turbidity', unit: 'NTU', icon: Beaker, color: 'from-amber-500 to-orange-500' },
  { label: 'Active Sensors', key: 'sensors', unit: 'online', icon: Activity, color: 'from-purple-500 to-pink-500' },
];

export default function MetricsGrid({ sensorData }) {
  const latestData = sensorData[sensorData.length - 1] || {};

  const getMetricValue = (key) => {
    if (key === 'sensors') return '24';
    return latestData[key] || '—';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">{metric.label}</span>
            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${metric.color}`}>
              <metric.icon className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-2xl font-bold text-white">{getMetricValue(metric.key)}</span>
            <span className="text-slate-400 text-sm mb-0.5">{metric.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
