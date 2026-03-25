import { useState } from 'react';
import { Calendar, Clock, Download, Filter } from 'lucide-react';

const presetRanges = [
  { label: 'Last 24h', value: '24h' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'Custom', value: 'custom' },
];

const granularityOptions = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const metricOptions = [
  { label: 'pH Level', value: 'pH', color: 'bg-purple-500' },
  { label: 'Turbidity', value: 'turbidity', color: 'bg-cyan-500' },
  { label: 'TDS', value: 'tds', color: 'bg-blue-500' },
  { label: 'Temperature', value: 'temperature', color: 'bg-orange-500' },
  { label: 'Flow Rate', value: 'flowRate', color: 'bg-emerald-500' },
  { label: 'Dissolved O₂', value: 'dissolvedOxygen', color: 'bg-pink-500' },
];

export default function TimeRangeSelector({ 
  selectedRange, 
  setSelectedRange, 
  granularity, 
  setGranularity,
  selectedMetrics,
  setSelectedMetrics,
  onExport 
}) {
  const [showMetricDropdown, setShowMetricDropdown] = useState(false);

  const toggleMetric = (metric) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
        {/* Time Range Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 -mx-1 px-1">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
          <div className="flex bg-slate-700/50 rounded-lg sm:rounded-xl p-1">
            {presetRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedRange === range.value
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range (shown when custom is selected) */}
        {selectedRange === 'custom' && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              className="bg-slate-700/50 border border-slate-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
            />
            <span className="text-slate-400 text-sm">to</span>
            <input
              type="date"
              className="bg-slate-700/50 border border-slate-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
            />
          </div>
        )}

        {/* Second Row on Mobile: Granularity, Metrics, Export */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:ml-auto">
          {/* Granularity Selector */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 hidden sm:block" />
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
              className="bg-slate-700/50 border border-slate-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {granularityOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Selector */}
          <div className="relative">
            <button
              onClick={() => setShowMetricDropdown(!showMetricDropdown)}
              className="flex items-center gap-1 sm:gap-2 bg-slate-700/50 border border-slate-600 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-white text-xs sm:text-sm hover:bg-slate-600/50 transition-colors"
            >
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Metrics ({selectedMetrics.length})</span>
            </button>

            {showMetricDropdown && (
              <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 bg-slate-800 border border-slate-700 rounded-xl p-2 sm:p-3 z-10 min-w-[180px] sm:min-w-[200px] shadow-xl">
                {metricOptions.map((metric) => (
                  <label
                    key={metric.value}
                    className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-slate-700/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric.value)}
                      onChange={() => toggleMetric(metric.value)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 bg-slate-700"
                    />
                    <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${metric.color}`} />
                    <span className="text-white text-xs sm:text-sm">{metric.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto lg:ml-0">
            <button
              onClick={() => onExport('csv')}
              className="flex items-center gap-1 sm:gap-2 bg-slate-700/50 border border-slate-600 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-white text-xs sm:text-sm hover:bg-slate-600/50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={() => onExport('pdf')}
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-white text-xs sm:text-sm hover:opacity-90 transition-opacity"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">PDF Report</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
