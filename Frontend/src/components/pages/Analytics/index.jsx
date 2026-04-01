import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';
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
      tds: Math.floor(200 + Math.random() * 300),
      temperature: (20 + Math.random() * 10).toFixed(1),
      flowRate: (50 + Math.random() * 50).toFixed(1),
      dissolvedOxygen: (6 + Math.random() * 3).toFixed(2),
    });
  }
  return data;
};

const RANGE_LABELS = {
  '24h': 'Last 24h',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  custom: 'Custom range',
};

const METRIC_REPORT_CONFIG = [
  { key: 'pH', label: 'pH Level', unit: '', decimals: 2 },
  { key: 'flowRate', label: 'Flow Rate', unit: 'L/min', decimals: 1 },
  { key: 'tds', label: 'TDS', unit: 'ppm', decimals: 0 },
  { key: 'temperature', label: 'Temperature', unit: 'C', decimals: 1 },
  { key: 'dissolvedOxygen', label: 'Dissolved Oxygen', unit: 'mg/L', decimals: 2 },
];

const getMetricStats = (data, metricKey) => {
  const values = data
    .map((entry) => Number(entry[metricKey]))
    .filter((value) => Number.isFinite(value));

  if (!values.length) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    average: total / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    latest: values[values.length - 1],
  };
};

const formatMetricValue = (metricConfig, value) => {
  if (!Number.isFinite(value)) {
    return 'N/A';
  }

  const formatted = value.toFixed(metricConfig.decimals);
  return metricConfig.unit ? `${formatted} ${metricConfig.unit}` : formatted;
};

export default function Analytics() {
  const [selectedRange, setSelectedRange] = useState('7d');
  const [granularity, setGranularity] = useState('hourly');
  const [selectedMetrics, setSelectedMetrics] = useState(['pH', 'flowRate']);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
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

  const downloadCsv = () => {
    const headers = [
      'Timestamp',
      ...METRIC_REPORT_CONFIG.map((metric) =>
        metric.unit ? `${metric.label} (${metric.unit})` : metric.label,
      ),
    ];

    const rows = analyticsData.map((point) => [
      point.time,
      ...METRIC_REPORT_CONFIG.map((metric) => point[metric.key]),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `analytics-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPdfReport = () => {
    const reportMetrics = METRIC_REPORT_CONFIG.filter((metric) =>
      selectedMetrics.includes(metric.key),
    );
    const metricsToRender = reportMetrics.length ? reportMetrics : METRIC_REPORT_CONFIG;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    let cursorY = margin;

    const ensureSpace = (heightNeeded = 24) => {
      if (cursorY + heightNeeded > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Water Analytics Report', margin, cursorY);
    cursorY += 24;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, cursorY);
    cursorY += 16;
    doc.text(`Range: ${RANGE_LABELS[selectedRange] || selectedRange}`, margin, cursorY);
    cursorY += 16;
    doc.text(`Granularity: ${granularity}`, margin, cursorY);
    cursorY += 16;
    doc.text(`Data points: ${analyticsData.length}`, margin, cursorY);
    cursorY += 16;
    doc.text(
      `Included metrics: ${metricsToRender.map((metric) => metric.label).join(', ')}`,
      margin,
      cursorY,
      { maxWidth: contentWidth },
    );
    cursorY += 24;

    doc.setDrawColor(148, 163, 184);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Metric Summary', margin, cursorY);
    cursorY += 20;

    const columnX = {
      metric: margin + 6,
      average: margin + 180,
      min: margin + 270,
      max: margin + 350,
      latest: margin + 430,
    };

    doc.setFillColor(30, 41, 59);
    doc.rect(margin, cursorY - 13, contentWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Metric', columnX.metric, cursorY + 1);
    doc.text('Average', columnX.average, cursorY + 1);
    doc.text('Min', columnX.min, cursorY + 1);
    doc.text('Max', columnX.max, cursorY + 1);
    doc.text('Latest', columnX.latest, cursorY + 1);
    cursorY += 24;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');

    metricsToRender.forEach((metric) => {
      ensureSpace(24);
      const stats = getMetricStats(analyticsData, metric.key);

      doc.text(metric.label, columnX.metric, cursorY);
      doc.text(stats ? formatMetricValue(metric, stats.average) : 'N/A', columnX.average, cursorY);
      doc.text(stats ? formatMetricValue(metric, stats.min) : 'N/A', columnX.min, cursorY);
      doc.text(stats ? formatMetricValue(metric, stats.max) : 'N/A', columnX.max, cursorY);
      doc.text(stats ? formatMetricValue(metric, stats.latest) : 'N/A', columnX.latest, cursorY);

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, cursorY + 6, pageWidth - margin, cursorY + 6);
      cursorY += 20;
    });

    const anomalySummary = [
      {
        label: 'pH outside safe range (6.5 to 8.5)',
        count: analyticsData.filter((point) => Number(point.pH) < 6.5 || Number(point.pH) > 8.5).length,
      },
      {
        label: 'TDS above 450 ppm',
        count: analyticsData.filter((point) => Number(point.tds) > 450).length,
      },
      {
        label: 'Dissolved Oxygen below 6.0 mg/L',
        count: analyticsData.filter((point) => Number(point.dissolvedOxygen) < 6).length,
      },
    ];

    ensureSpace(90);
    cursorY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Anomaly Snapshot', margin, cursorY);
    cursorY += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    anomalySummary.forEach((item) => {
      ensureSpace(18);
      doc.text(`${item.label}: ${item.count} events`, margin, cursorY);
      cursorY += 16;
    });

    const latestPoint = analyticsData[analyticsData.length - 1];
    ensureSpace(22 + metricsToRender.length * 14);
    cursorY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Latest Reading', margin, cursorY);
    cursorY += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    metricsToRender.forEach((metric) => {
      ensureSpace(16);
      doc.text(
        `${metric.label}: ${formatMetricValue(metric, Number(latestPoint[metric.key]))}`,
        margin,
        cursorY,
      );
      cursorY += 14;
    });

    doc.save(`analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleExport = (format) => {
    if (!analyticsData.length) {
      alert('No analytics data available to export yet.');
      return;
    }

    if (format === 'csv') {
      downloadCsv();
      return;
    }

    if (format === 'pdf') {
      try {
        setIsExporting(true);
        downloadPdfReport();
      } catch (error) {
        console.error('Failed to export PDF report:', error);
        alert('Failed to generate PDF report. Please try again.');
      } finally {
        setIsExporting(false);
      }
    }
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
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex-shrink-0">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">Analytics Dashboard</h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Comprehensive water quality analytics and insights
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <span className="text-xs sm:text-sm text-slate-400 hidden sm:inline">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-700/50 rounded-xl text-white hover:bg-slate-600/50 transition-colors disabled:opacity-50 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
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
        isExporting={isExporting}
        onExport={handleExport}
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 sm:py-20">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-sm sm:text-base">Loading analytics data...</span>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <KPICards data={analyticsData} />

          {/* Trend Analysis */}
          <TrendAnalysis data={analyticsData} selectedMetrics={selectedMetrics} />

          {/* Comparative & Statistical Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ComparativeAnalysis />
            <StatisticalCharts data={analyticsData} />
          </div>

          {/* Anomaly Insights */}
          <div>
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-3 sm:mb-4">Anomaly Insights</h2>
            <AnomalyInsights />
          </div>

          {/* Consumption Analytics */}
          <div>
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-3 sm:mb-4">Consumption Analytics</h2>
            <ConsumptionAnalytics />
          </div>
        </>
      )}
    </div>
  );
}
