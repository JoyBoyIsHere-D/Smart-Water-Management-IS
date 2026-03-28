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
    label: 'Flow Rate',
    value: '2.3 L/min',
    status: 'good',
    range: '< 100 L/min',
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
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex-shrink-0">
          <Waves className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Water Quality</h1>
          <p className="text-slate-400 text-xs sm:text-sm truncate">Real-time water quality monitoring and analysis</p>
        </div>
      </div>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {qualityMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-slate-400 text-xs sm:text-sm font-medium truncate pr-2">{metric.label}</span>
              <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${metric.color} flex-shrink-0`}>
                <metric.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{metric.value}</div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
              <span className={`px-2 py-0.5 sm:py-1 rounded-lg text-xs font-medium ${getStatusColor(metric.status)} w-fit`}>
                {metric.status}
              </span>
              <span className="text-xs text-slate-500 truncate">Range: {metric.range}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <SensorChart data={sensorData} />
        <QualityPieChart />
      </div>

      {/* Quality Standards */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">WHO/EPA Water Quality Standards</h3>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {[
            { param: 'pH Level', current: '7.2', who: '6.5 - 8.5', epa: '6.5 - 8.5', status: 'Compliant', statusColor: 'text-emerald-400 bg-emerald-500/20' },
            { param: 'Flow Rate', current: '65 L/min', who: '< 100 L/min', epa: '< 80 L/min', status: 'Review', statusColor: 'text-amber-400 bg-amber-500/20' },
            { param: 'TDS', current: '342 ppm', who: '< 600 ppm', epa: '< 500 ppm', status: 'Compliant', statusColor: 'text-emerald-400 bg-emerald-500/20' },
            { param: 'Dissolved Oxygen', current: '7.5 mg/L', who: '> 5 mg/L', epa: '> 6 mg/L', status: 'Compliant', statusColor: 'text-emerald-400 bg-emerald-500/20' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-white">{item.param}</span>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${item.statusColor}`}>{item.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-slate-500 text-xs block">Current</span>
                  <span className="text-white">{item.current}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">WHO</span>
                  <span className="text-slate-400">{item.who}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">EPA</span>
                  <span className="text-slate-400">{item.epa}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
                <td className="py-3 text-white">Flow Rate</td>
                <td className="py-3 text-white">65 L/min</td>
                <td className="py-3 text-slate-400">&lt; 100 L/min</td>
                <td className="py-3 text-slate-400">&lt; 80 L/min</td>
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
