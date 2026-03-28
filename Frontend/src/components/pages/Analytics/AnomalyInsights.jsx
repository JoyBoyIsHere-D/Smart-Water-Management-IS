import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { AlertTriangle, TrendingUp } from 'lucide-react';

// Mock anomaly type data
const anomalyTypeData = [
  { name: 'pH Deviation', value: 35, color: '#8b5cf6' },
  { name: 'Flow Rate Spike', value: 25, color: '#06b6d4' },
  { name: 'TDS Anomaly', value: 18, color: '#3b82f6' },
  { name: 'Temperature', value: 12, color: '#f97316' },
  { name: 'Dissolved O₂', value: 10, color: '#10b981' },
];

// Mock anomaly frequency data (last 14 days)
const generateAnomalyFrequency = () => {
  const data = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      critical: Math.floor(Math.random() * 3),
      warning: Math.floor(Math.random() * 5),
      info: Math.floor(Math.random() * 8),
    });
  }
  return data;
};

const frequencyData = generateAnomalyFrequency();

const topAnomalies = [
  { metric: 'pH Level', count: 12, severity: 'critical', trend: 'decreasing' },
  { metric: 'Flow Rate', count: 8, severity: 'warning', trend: 'stable' },
  { metric: 'TDS', count: 6, severity: 'warning', trend: 'increasing' },
  { metric: 'Dissolved O₂', count: 4, severity: 'info', trend: 'decreasing' },
];

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return 'text-red-400 bg-red-500/20';
    case 'warning': return 'text-amber-400 bg-amber-500/20';
    case 'info': return 'text-blue-400 bg-blue-500/20';
    default: return 'text-slate-400 bg-slate-500/20';
  }
};

const getTrendIcon = (trend) => {
  switch (trend) {
    case 'increasing': return '↑';
    case 'decreasing': return '↓';
    default: return '→';
  }
};

export default function AnomalyInsights() {
  const totalAnomalies = anomalyTypeData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Anomaly Frequency Timeline */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-3 sm:p-4 lg:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex-shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white">Anomaly Timeline</h3>
            <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Frequency over last 14 days</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={frequencyData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="url(#colorCritical)" name="Critical" />
            <Area type="monotone" dataKey="warning" stackId="1" stroke="#f59e0b" fill="url(#colorWarning)" name="Warning" />
            <Area type="monotone" dataKey="info" stackId="1" stroke="#3b82f6" fill="url(#colorInfo)" name="Info" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Anomaly Type Breakdown */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-3 sm:p-4 lg:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white">Anomaly Distribution</h3>
            <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">By metric type</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <ResponsiveContainer width="100%" height={160} className="sm:!w-1/2">
            <PieChart>
              <Pie
                data={anomalyTypeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {anomalyTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 w-full sm:w-auto space-y-2 sm:space-y-3">
            {anomalyTypeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs sm:text-sm text-slate-300">{item.name}</span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-white">
                  {((item.value / totalAnomalies) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most Affected Metrics */}
      <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-3 sm:p-4 lg:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Most Affected Metrics</h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {topAnomalies.map((item, index) => (
            <div
              key={index}
              className="bg-slate-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-600/30"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-white font-medium text-sm sm:text-base truncate pr-2">{item.metric}</span>
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs font-medium flex-shrink-0 ${getSeverityColor(item.severity)}`}>
                  {item.severity}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xl sm:text-3xl font-bold text-white">{item.count}</span>
                  <span className="text-slate-400 text-xs sm:text-sm ml-1 hidden sm:inline">anomalies</span>
                </div>
                <span className={`text-base sm:text-lg ${
                  item.trend === 'decreasing' ? 'text-emerald-400' :
                  item.trend === 'increasing' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {getTrendIcon(item.trend)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
