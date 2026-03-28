import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BarChart2, ChevronDown } from 'lucide-react';

const metricOptions = [
  { label: 'pH Level', value: 'pH' },
  { label: 'Flow Rate', value: 'flowRate' },
  { label: 'TDS', value: 'tds' },
  { label: 'Temperature', value: 'temperature' },
  { label: 'Dissolved O₂', value: 'dissolvedOxygen' },
];

// Generate histogram data
const generateHistogramData = (data, metric) => {
  const values = data.map(d => parseFloat(d[metric])).filter(v => !isNaN(v));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binCount = 10;
  const binSize = (max - min) / binCount;
  
  const bins = Array(binCount).fill(0).map((_, i) => ({
    range: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
    count: 0,
    min: min + i * binSize,
    max: min + (i + 1) * binSize,
  }));
  
  values.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
    if (binIndex >= 0 && binIndex < binCount) {
      bins[binIndex].count++;
    }
  });
  
  return bins;
};

// Calculate statistics
const calculateStats = (data, metric) => {
  const values = data.map(d => parseFloat(d[metric])).filter(v => !isNaN(v)).sort((a, b) => a - b);
  const n = values.length;
  
  if (n === 0) return null;
  
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  const median = n % 2 === 0 
    ? (values[n/2 - 1] + values[n/2]) / 2 
    : values[Math.floor(n/2)];
    
  const q1 = values[Math.floor(n * 0.25)];
  const q3 = values[Math.floor(n * 0.75)];
  const p95 = values[Math.floor(n * 0.95)];
  
  return {
    min: values[0],
    max: values[n - 1],
    mean,
    median,
    stdDev,
    q1,
    q3,
    p95,
    count: n
  };
};

const StatBox = ({ label, value, unit = '' }) => (
  <div className="bg-slate-700/30 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
    <span className="text-slate-400 text-xs sm:text-sm">{label}</span>
    <div className="text-base sm:text-xl font-bold text-white mt-0.5 sm:mt-1">
      {typeof value === 'number' ? value.toFixed(2) : value}
      {unit && <span className="text-slate-400 text-xs sm:text-sm ml-1">{unit}</span>}
    </div>
  </div>
);

export default function StatisticalCharts({ data }) {
  const [selectedMetric, setSelectedMetric] = useState('pH');
  const [showDropdown, setShowDropdown] = useState(false);

  const histogramData = generateHistogramData(data, selectedMetric);
  const stats = calculateStats(data, selectedMetric);

  const maxCount = Math.max(...histogramData.map(d => d.count));

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex-shrink-0">
            <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white">Statistical Analysis</h3>
            <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Distribution and statistics</p>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 sm:gap-2 bg-slate-700/50 border border-slate-600 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-white text-xs sm:text-sm hover:bg-slate-600/50 transition-colors"
          >
            <span>{metricOptions.find(m => m.value === selectedMetric)?.label}</span>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {showDropdown && (
            <div className="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-10 shadow-xl min-w-[140px]">
              {metricOptions.map(metric => (
                <button
                  key={metric.value}
                  onClick={() => {
                    setSelectedMetric(metric.value);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${
                    selectedMetric === metric.value
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {metric.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Histogram */}
        <div>
          <h4 className="text-white font-medium text-sm sm:text-base mb-3 sm:mb-4">Value Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={histogramData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="range"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 8 }}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value) => [value, 'Count']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {histogramData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`rgba(6, 182, 212, ${0.3 + (entry.count / maxCount) * 0.7})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics Summary */}
        <div>
          <h4 className="text-white font-medium text-sm sm:text-base mb-3 sm:mb-4">Summary Statistics</h4>
          {stats ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <StatBox label="Minimum" value={stats.min} />
              <StatBox label="Maximum" value={stats.max} />
              <StatBox label="Mean" value={stats.mean} />
              <StatBox label="Median" value={stats.median} />
              <StatBox label="Std. Dev" value={stats.stdDev} />
              <StatBox label="95th %" value={stats.p95} />
              <StatBox label="Q1 (25th)" value={stats.q1} />
              <StatBox label="Q3 (75th)" value={stats.q3} />
            </div>
          ) : (
            <div className="text-slate-400 text-center py-6 sm:py-8 text-sm">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
