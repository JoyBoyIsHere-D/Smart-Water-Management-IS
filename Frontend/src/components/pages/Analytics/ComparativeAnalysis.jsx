import { ArrowUpRight, ArrowDownRight, Minus, BarChart3 } from 'lucide-react';

const comparisonData = [
  {
    metric: 'Water Health Index',
    current: 82.4,
    previous: 78.2,
    unit: '',
    format: 'number'
  },
  {
    metric: 'Average pH',
    current: 7.2,
    previous: 7.1,
    unit: '',
    format: 'decimal'
  },
  {
    metric: 'Avg. Turbidity',
    current: 2.8,
    previous: 3.2,
    unit: 'NTU',
    format: 'decimal'
  },
  {
    metric: 'Avg. TDS',
    current: 342,
    previous: 358,
    unit: 'ppm',
    format: 'number'
  },
  {
    metric: 'Total Consumption',
    current: 1245000,
    previous: 1180000,
    unit: 'L',
    format: 'large'
  },
  {
    metric: 'Anomalies Detected',
    current: 24,
    previous: 31,
    unit: '',
    format: 'number'
  },
];

const formatValue = (value, format) => {
  switch (format) {
    case 'large':
      return value >= 1000000 
        ? `${(value / 1000000).toFixed(1)}M` 
        : value >= 1000 
          ? `${(value / 1000).toFixed(0)}K` 
          : value;
    case 'decimal':
      return value.toFixed(1);
    default:
      return value;
  }
};

const calculateChange = (current, previous) => {
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change).toFixed(1),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  };
};

export default function ComparativeAnalysis() {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Period Comparison</h3>
          <p className="text-sm text-slate-400">Current vs Previous Period</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left text-slate-400 text-sm font-medium pb-4">Metric</th>
              <th className="text-right text-slate-400 text-sm font-medium pb-4">Current</th>
              <th className="text-right text-slate-400 text-sm font-medium pb-4">Previous</th>
              <th className="text-right text-slate-400 text-sm font-medium pb-4">Change</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((item, index) => {
              const change = calculateChange(item.current, item.previous);
              const isPositiveChange = item.metric === 'Anomalies Detected' || item.metric === 'Avg. Turbidity'
                ? change.direction === 'down'
                : change.direction === 'up';
              
              return (
                <tr 
                  key={index} 
                  className="border-b border-slate-700/30 last:border-0"
                >
                  <td className="py-4">
                    <span className="text-white font-medium">{item.metric}</span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-white font-semibold">
                      {formatValue(item.current, item.format)}
                    </span>
                    {item.unit && (
                      <span className="text-slate-400 text-sm ml-1">{item.unit}</span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-slate-400">
                      {formatValue(item.previous, item.format)}
                    </span>
                    {item.unit && (
                      <span className="text-slate-500 text-sm ml-1">{item.unit}</span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${
                      isPositiveChange 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : change.direction === 'neutral'
                          ? 'bg-slate-500/20 text-slate-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}>
                      {change.direction === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : change.direction === 'down' ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{change.value}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
