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
  { label: 'Turbidity', value: 'turbidity' },
  { label: 'TDS', value: 'tds' },
  { label: 'Temperature', value: 'temperature' },
  { label: 'Flow Rate', value: 'flowRate' },
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
  <div className="bg-slate-700/30 rounded-xl p-4">
    <span className="text-slate-400 text-sm">{label}</span>
    <div className="text-xl font-bold text-white mt-1">
      {typeof value === 'number' ? value.toFixed(2) : value}
      {unit && <span className="text-slate-400 text-sm ml-1">{unit}</span>}
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
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Statistical Analysis</h3>
            <p className="text-sm text-slate-400">Distribution and statistics</p>
          </div>
        </div>
        
        {/* Metric Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm hover:bg-slate-600/50 transition-colors"
          >
            <span>{metricOptions.find(m => m.value === selectedMetric)?.label}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showDropdown && (
            <div className="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-10 shadow-xl">
              {metricOptions.map(metric => (
                <button
                  key={metric.value}
                  onClick={() => {
                    setSelectedMetric(metric.value);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histogram */}
        <div>
          <h4 className="text-white font-medium mb-4">Value Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="range" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff'
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
          <h4 className="text-white font-medium mb-4">Summary Statistics</h4>
          {stats ? (
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Minimum" value={stats.min} />
              <StatBox label="Maximum" value={stats.max} />
              <StatBox label="Mean" value={stats.mean} />
              <StatBox label="Median" value={stats.median} />
              <StatBox label="Std. Deviation" value={stats.stdDev} />
              <StatBox label="95th Percentile" value={stats.p95} />
              <StatBox label="Q1 (25th)" value={stats.q1} />
              <StatBox label="Q3 (75th)" value={stats.q3} />
            </div>
          ) : (
            <div className="text-slate-400 text-center py-8">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
