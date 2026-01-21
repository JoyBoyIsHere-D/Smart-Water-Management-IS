import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import TimeRangeSelector from './TimeRangeSelector';
import KPICards from './KPICards';
import TrendAnalysis from './TrendAnalysis';
import ComparativeAnalysis from './ComparativeAnalysis';
import StatisticalCharts from './StatisticalCharts';
import AnomalyInsights from './AnomalyInsights';
import ConsumptionAnalytics from './ConsumptionAnalytics';

// Generate mock time series data
const generateTimeSeriesData = (days = 7) => {
  const data = [];
  const now = new Date();
  const hoursPerDay = 24;
  const totalPoints = days * hoursPerDay;
  
  for (let i = totalPoints - 1; i >= 0; i--) {
    const time = new Date(now - i * 3600000);
    data.push({
      time: time.toLocaleTimeString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      timestamp: time.getTime(),
      pH: (6.5 + Math.random() * 1.5).toFixed(2),
      turbidity: (1 + Math.random() * 4).toFixed(2),
      tds: Math.floor(200 + Math.random() * 300),
      temperature: (20 + Math.random() * 10).toFixed(1),
      flowRate: (50 + Math.random() * 50).toFixed(1),
      dissolvedOxygen: (6 + Math.random() * 3).toFixed(2),
    });
  }
  return data;
};

export default function Analytics() {
  const [selectedRange, setSelectedRange] = useState('7d');
  const [granularity, setGranularity] = useState('hourly');
  const [selectedMetrics, setSelectedMetrics] = useState(['pH', 'turbidity']);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Get days based on selected range
  const getDaysFromRange = (range) => {
    switch (range) {
      case '24h': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  };

  // Load data based on selected range
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const days = getDaysFromRange(selectedRange);
      setAnalyticsData(generateTimeSeriesData(days));
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 500);
  }, [selectedRange]);

  const handleExport = (format) => {
    // In a real app, this would trigger a download
    console.log(`Exporting data as ${format}...`);
    alert(`Exporting analytics report as ${format.toUpperCase()}. This feature will be implemented with backend integration.`);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const days = getDaysFromRange(selectedRange);
      setAnalyticsData(generateTimeSeriesData(days));
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-slate-400">
              Comprehensive water quality analytics and insights
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-xl text-white hover:bg-slate-600/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <TimeRangeSelector
        selectedRange={selectedRange}
        setSelectedRange={setSelectedRange}
        granularity={granularity}
        setGranularity={setGranularity}
        selectedMetrics={selectedMetrics}
        setSelectedMetrics={setSelectedMetrics}
        onExport={handleExport}
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400">Loading analytics data...</span>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <KPICards data={analyticsData} />

          {/* Trend Analysis */}
          <TrendAnalysis data={analyticsData} selectedMetrics={selectedMetrics} />

          {/* Comparative & Statistical Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComparativeAnalysis />
            <StatisticalCharts data={analyticsData} />
          </div>

          {/* Anomaly Insights */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Anomaly Insights</h2>
            <AnomalyInsights />
          </div>

          {/* Consumption Analytics */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Consumption Analytics</h2>
            <ConsumptionAnalytics />
          </div>
        </>
      )}
    </div>
  );
}
