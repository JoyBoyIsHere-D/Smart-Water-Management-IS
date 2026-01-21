import { AlertTriangle, AlertCircle, Info, CheckCircle, Clock, Filter } from 'lucide-react';
import { useState } from 'react';

const mockAnomalies = [
  {
    id: 1,
    type: 'critical',
    metric: 'pH Level',
    message: 'pH level dropped below safe threshold (5.8)',
    timestamp: new Date(Date.now() - 1800000),
    acknowledged: false,
    value: 5.8,
    threshold: 6.5,
  },
  {
    id: 2,
    type: 'warning',
    metric: 'Turbidity',
    message: 'Turbidity spike detected (8.2 NTU)',
    timestamp: new Date(Date.now() - 3600000),
    acknowledged: true,
    value: 8.2,
    threshold: 5.0,
  },
  {
    id: 3,
    type: 'warning',
    metric: 'Flow Rate',
    message: 'Unusual flow rate pattern detected',
    timestamp: new Date(Date.now() - 7200000),
    acknowledged: false,
    value: 120,
    threshold: 100,
  },
  {
    id: 4,
    type: 'info',
    metric: 'TDS',
    message: 'TDS approaching upper limit (480 ppm)',
    timestamp: new Date(Date.now() - 10800000),
    acknowledged: true,
    value: 480,
    threshold: 500,
  },
  {
    id: 5,
    type: 'critical',
    metric: 'Temperature',
    message: 'Temperature exceeded safe limit (35°C)',
    timestamp: new Date(Date.now() - 14400000),
    acknowledged: false,
    value: 35,
    threshold: 30,
  },
];

const getAnomalyIcon = (type) => {
  switch (type) {
    case 'critical': return AlertTriangle;
    case 'warning': return AlertCircle;
    case 'info': return Info;
    default: return Info;
  }
};

const getAnomalyColor = (type) => {
  switch (type) {
    case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
    case 'warning': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    case 'info': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
  }
};

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState(mockAnomalies);
  const [filter, setFilter] = useState('all');

  const handleAcknowledge = (id) => {
    setAnomalies(anomalies.map(a => 
      a.id === id ? { ...a, acknowledged: true } : a
    ));
  };

  const filteredAnomalies = filter === 'all' 
    ? anomalies 
    : anomalies.filter(a => a.type === filter);

  const stats = {
    total: anomalies.length,
    critical: anomalies.filter(a => a.type === 'critical').length,
    warning: anomalies.filter(a => a.type === 'warning').length,
    unacknowledged: anomalies.filter(a => !a.acknowledged).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Anomaly Detection</h1>
            <p className="text-slate-400">Real-time anomaly monitoring and alerts</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5">
          <div className="text-slate-400 text-sm mb-1">Total Anomalies</div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-red-500/30 p-5">
          <div className="text-red-400 text-sm mb-1">Critical</div>
          <div className="text-3xl font-bold text-red-400">{stats.critical}</div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-5">
          <div className="text-amber-400 text-sm mb-1">Warnings</div>
          <div className="text-3xl font-bold text-amber-400">{stats.warning}</div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5">
          <div className="text-slate-400 text-sm mb-1">Unacknowledged</div>
          <div className="text-3xl font-bold text-white">{stats.unacknowledged}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-slate-400" />
        <div className="flex bg-slate-700/50 rounded-xl p-1">
          {['all', 'critical', 'warning', 'info'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                filter === type
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filteredAnomalies.map((anomaly) => {
          const Icon = getAnomalyIcon(anomaly.type);
          const colorClass = getAnomalyColor(anomaly.type);
          
          return (
            <div
              key={anomaly.id}
              className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border p-6 ${
                anomaly.acknowledged ? 'border-slate-700/50 opacity-60' : colorClass.split(' ')[2]
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${colorClass.split(' ').slice(0, 2).join(' ')}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-semibold">{anomaly.metric}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${colorClass.split(' ').slice(0, 2).join(' ')}`}>
                        {anomaly.type}
                      </span>
                      {anomaly.acknowledged && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/20">
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300">{anomaly.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTimeAgo(anomaly.timestamp)}
                      </span>
                      <span>Value: {anomaly.value}</span>
                      <span>Threshold: {anomaly.threshold}</span>
                    </div>
                  </div>
                </div>
                
                {!anomaly.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(anomaly.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-xl text-slate-300 hover:bg-slate-600/50 hover:text-white transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
