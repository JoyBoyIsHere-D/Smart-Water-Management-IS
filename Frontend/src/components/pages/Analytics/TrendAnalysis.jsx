import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Maximize2, Eye, EyeOff } from 'lucide-react';

const metricColors = {
  pH: '#8b5cf6',
  flowRate: '#06b6d4',
  tds: '#3b82f6',
  temperature: '#f97316',
  dissolvedOxygen: '#10b981',
};

const metricLabels = {
  pH: 'pH Level',
  flowRate: 'Flow Rate (L/min)',
  tds: 'TDS (ppm)',
  temperature: 'Temperature (°C)',
  dissolvedOxygen: 'Dissolved O₂ (mg/L)',
};

export default function TrendAnalysis({ data, selectedMetrics }) {
  const [showMovingAvg, setShowMovingAvg] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calculate moving average
  const dataWithMA = data.map((item, index, arr) => {
    const maWindow = 5;
    const start = Math.max(0, index - maWindow + 1);
    const windowData = arr.slice(start, index + 1);
    
    const maValues = {};
    selectedMetrics.forEach(metric => {
      const avg = windowData.reduce((sum, d) => sum + parseFloat(d[metric] || 0), 0) / windowData.length;
      maValues[`${metric}_ma`] = avg.toFixed(2);
    });
    
    return { ...item, ...maValues };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 sm:p-4 shadow-xl max-w-[200px] sm:max-w-none">
          <p className="text-slate-400 text-xs sm:text-sm mb-1 sm:mb-2 truncate">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300 truncate">{entry.name}:</span>
              <span className="text-white font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-3 sm:p-4 lg:p-6 ${isFullscreen ? 'fixed inset-2 sm:inset-4 z-50' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex-shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white">Trend Analysis</h3>
            <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Historical data with moving averages</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMovingAvg(!showMovingAvg)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
              showMovingAvg
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-700/50 text-slate-400 hover:text-white'
            }`}
          >
            {showMovingAvg ? <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline">Moving Avg</span>
            <span className="sm:hidden">MA</span>
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
        {selectedMetrics.map(metric => (
          <div key={metric} className="flex items-center gap-1.5 sm:gap-2">
            <span
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
              style={{ backgroundColor: metricColors[metric] }}
            />
            <span className="text-xs sm:text-sm text-slate-300">{metricLabels[metric]}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={isFullscreen ? 500 : (window.innerWidth < 640 ? 250 : 350)}>
        <LineChart data={dataWithMA} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="time"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          
          {selectedMetrics.map(metric => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={metricColors[metric]}
              strokeWidth={2}
              dot={false}
              name={metricLabels[metric]}
            />
          ))}
          
          {showMovingAvg && selectedMetrics.map(metric => (
            <Line
              key={`${metric}_ma`}
              type="monotone"
              dataKey={`${metric}_ma`}
              stroke={metricColors[metric]}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name={`${metricLabels[metric]} (MA)`}
              opacity={0.6}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
