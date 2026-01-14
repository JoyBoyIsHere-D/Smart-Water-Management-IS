import { Activity } from 'lucide-react';

const getHealthIndexColor = (index) => {
  if (index >= 80) return 'text-emerald-500';
  if (index >= 60) return 'text-blue-500';
  if (index >= 40) return 'text-amber-500';
  return 'text-red-500';
};

const getHealthIndexBg = (index) => {
  if (index >= 80) return 'from-emerald-500 to-emerald-600';
  if (index >= 60) return 'from-blue-500 to-blue-600';
  if (index >= 40) return 'from-amber-500 to-amber-600';
  return 'from-red-500 to-red-600';
};

const getHealthStatus = (index) => {
  if (index >= 80) return 'Excellent water quality';
  if (index >= 60) return 'Good water quality';
  if (index >= 40) return 'Fair water quality';
  return 'Poor water quality';
};

export default function HealthIndexCard({ healthIndex }) {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 font-medium">Water Health Index</h3>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${getHealthIndexBg(healthIndex)}`}>
          <Activity className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-5xl font-bold ${getHealthIndexColor(healthIndex)}`}>{healthIndex}</span>
        <span className="text-slate-400 mb-2">/100</span>
      </div>
      <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getHealthIndexBg(healthIndex)} transition-all duration-500`}
          style={{ width: `${healthIndex}%` }}
        />
      </div>
      <p className="text-sm text-slate-400 mt-2">{getHealthStatus(healthIndex)}</p>
    </div>
  );
}
