import { useOutletContext } from 'react-router-dom';
import { Waves, Beaker, Droplets, ThermometerSun, Activity } from 'lucide-react';
import { SensorChart, QualityPieChart } from '../ui';

const qualityMetrics = [
  {
    label: 'pH Level',
    value: '7.2',
    status: 'optimal',
    range: '6.5 - 8.5',
    icon: Beaker,
    color: 'from-purple-500 to-purple-600'
  },
  {
    label: 'Turbidity',
    value: '2.3 NTU',
    status: 'good',
    range: '< 5 NTU',
    icon: Droplets,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    label: 'TDS',
    value: '342 ppm',
    status: 'optimal',
    range: '< 500 ppm',
    icon: Activity,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    label: 'Temperature',
    value: '24.5°C',
    status: 'normal',
    range: '20 - 30°C',
    icon: ThermometerSun,
    color: 'from-orange-500 to-red-500'
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'optimal': return 'text-emerald-400 bg-emerald-500/20';
    case 'good': return 'text-blue-400 bg-blue-500/20';
    case 'normal': return 'text-amber-400 bg-amber-500/20';
    case 'warning': return 'text-orange-400 bg-orange-500/20';
    case 'critical': return 'text-red-400 bg-red-500/20';
    default: return 'text-slate-400 bg-slate-500/20';
  }
};

export default function WaterQuality() {
  const { sensorData } = useOutletContext();

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
          <Waves className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Water Quality</h1>
          <p className="text-slate-400">Real-time water quality monitoring and analysis</p>
        </div>
      </div>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {qualityMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 font-medium">{metric.label}</span>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color}`}>
                <metric.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(metric.status)}`}>
                {metric.status}
              </span>
              <span className="text-xs text-slate-500">Range: {metric.range}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SensorChart data={sensorData} />
        <QualityPieChart />
      </div>

      {/* Quality Standards */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">WHO/EPA Water Quality Standards</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-400 text-sm font-medium pb-3">Parameter</th>
                <th className="text-left text-slate-400 text-sm font-medium pb-3">Current Value</th>
                <th className="text-left text-slate-400 text-sm font-medium pb-3">WHO Standard</th>
                <th className="text-left text-slate-400 text-sm font-medium pb-3">EPA Standard</th>
                <th className="text-left text-slate-400 text-sm font-medium pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/30">
                <td className="py-3 text-white">pH Level</td>
                <td className="py-3 text-white">7.2</td>
                <td className="py-3 text-slate-400">6.5 - 8.5</td>
                <td className="py-3 text-slate-400">6.5 - 8.5</td>
                <td className="py-3"><span className="px-2 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/20">Compliant</span></td>
              </tr>
              <tr className="border-b border-slate-700/30">
                <td className="py-3 text-white">Turbidity</td>
                <td className="py-3 text-white">2.3 NTU</td>
                <td className="py-3 text-slate-400">&lt; 5 NTU</td>
                <td className="py-3 text-slate-400">&lt; 1 NTU</td>
                <td className="py-3"><span className="px-2 py-1 rounded-lg text-xs font-medium text-amber-400 bg-amber-500/20">Review</span></td>
              </tr>
              <tr className="border-b border-slate-700/30">
                <td className="py-3 text-white">TDS</td>
                <td className="py-3 text-white">342 ppm</td>
                <td className="py-3 text-slate-400">&lt; 600 ppm</td>
                <td className="py-3 text-slate-400">&lt; 500 ppm</td>
                <td className="py-3"><span className="px-2 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/20">Compliant</span></td>
              </tr>
              <tr>
                <td className="py-3 text-white">Dissolved Oxygen</td>
                <td className="py-3 text-white">7.5 mg/L</td>
                <td className="py-3 text-slate-400">&gt; 5 mg/L</td>
                <td className="py-3 text-slate-400">&gt; 6 mg/L</td>
                <td className="py-3"><span className="px-2 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/20">Compliant</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
