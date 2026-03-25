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
    <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-slate-400 text-xs sm:text-sm font-medium">Water Health Index</h3>
        <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${getHealthIndexBg(healthIndex)}`}>
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      </div>
      <div className="flex items-end gap-1 sm:gap-2">
        <span className={`text-3xl sm:text-5xl font-bold ${getHealthIndexColor(healthIndex)}`}>{healthIndex}</span>
        <span className="text-slate-400 mb-1 sm:mb-2 text-sm">/100</span>
      </div>
      <div className="mt-3 sm:mt-4 h-1.5 sm:h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getHealthIndexBg(healthIndex)} transition-all duration-500`}
          style={{ width: `${healthIndex}%` }}
        />
      </div>
      <p className="text-xs sm:text-sm text-slate-400 mt-2">{getHealthStatus(healthIndex)}</p>
    </div>
  );
}
