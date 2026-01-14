import { AlertTriangle, MapPin, Clock } from 'lucide-react';

const anomalyData = [
  { id: 1, type: 'High Turbidity', location: 'Sensor #12', time: '2 min ago', severity: 'high' },
  { id: 2, type: 'pH Deviation', location: 'Sensor #07', time: '15 min ago', severity: 'medium' },
  { id: 3, type: 'Flow Rate Drop', location: 'Sensor #03', time: '1 hour ago', severity: 'low' },
];

const getSeverityStyle = (severity) => {
  switch (severity) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getSeverityIconColor = (severity) => {
  switch (severity) {
    case 'high': return 'text-red-500';
    case 'medium': return 'text-amber-500';
    case 'low': return 'text-blue-500';
    default: return 'text-gray-500';
  }
};

export default function AnomalyAlerts() {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Anomaly Alerts</h3>
        <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
          {anomalyData.length} Active
        </span>
      </div>
      <div className="space-y-3">
        {anomalyData.map((anomaly) => (
          <div
            key={anomaly.id}
            className={`p-4 rounded-xl border ${getSeverityStyle(anomaly.severity)} bg-opacity-50`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{anomaly.type}</p>
                <div className="flex items-center gap-3 mt-1 text-sm opacity-75">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {anomaly.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {anomaly.time}
                  </span>
                </div>
              </div>
              <AlertTriangle className={`w-5 h-5 ${getSeverityIconColor(anomaly.severity)}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
