import { useState, useEffect } from 'react';
import { 
  Network, Server, Activity, Play, RefreshCw, Plus, Trash2, 
  CheckCircle, XCircle, Clock, Wifi, WifiOff, Database,
  TrendingUp, Users, Cpu, BarChart3
} from 'lucide-react';

const ADMIN_SERVER = 'http://localhost:5000';

const getStatusColor = (status) => {
  switch (status) {
    case 'online':
    case 'connected':
      return 'text-emerald-400 bg-emerald-500/20';
    case 'offline':
    case 'failed':
      return 'text-red-400 bg-red-500/20';
    case 'timeout':
      return 'text-amber-400 bg-amber-500/20';
    default:
      return 'text-slate-400 bg-slate-500/20';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'online':
    case 'connected':
      return CheckCircle;
    case 'offline':
    case 'failed':
      return XCircle;
    case 'timeout':
      return Clock;
    default:
      return Wifi;
  }
};

export default function FederatedLearning() {
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({ ip: '', port: '5001', id: '' });
  const [clientsData, setClientsData] = useState([]);
  const [clientsMetrics, setClientsMetrics] = useState([]);
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [loading, setLoading] = useState({ clients: false, data: false, metrics: false, training: false });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('clients');

  useEffect(() => {
    fetchClients();
  }, []);

  // Poll training status when training is active
  useEffect(() => {
    let interval;
    if (trainingStatus?.is_training) {
      interval = setInterval(fetchTrainingStatus, 2000);
    }
    return () => clearInterval(interval);
  }, [trainingStatus?.is_training]);

  const fetchClients = async () => {
    setLoading(prev => ({ ...prev, clients: true }));
    try {
      const response = await fetch(`${ADMIN_SERVER}/api/clients`);
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      setError('Failed to connect to admin server. Make sure it is running.');
    }
    setLoading(prev => ({ ...prev, clients: false }));
  };

  const addClient = async () => {
    if (!newClient.ip || !newClient.id) {
      setError('Please enter both IP address and Client ID');
      return;
    }

    try {
      const response = await fetch(`${ADMIN_SERVER}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });

      const data = await response.json();
      
      if (response.ok) {
        setClients(data.clients || []);
        setNewClient({ ip: '', port: '5001', id: '' });
        setError(null);
      } else {
        setError(data.error || 'Failed to add client');
      }
    } catch (err) {
      setError('Failed to connect to admin server');
    }
  };

  const removeClient = async (clientId) => {
    try {
      await fetch(`${ADMIN_SERVER}/api/clients/${clientId}`, { method: 'DELETE' });
      fetchClients();
    } catch (err) {
      setError('Failed to remove client');
    }
  };

  const checkClientsHealth = async () => {
    setLoading(prev => ({ ...prev, clients: true }));
    try {
      const response = await fetch(`${ADMIN_SERVER}/api/clients/health`);
      if (response.ok) {
        const data = await response.json();
        // Update clients with health status
        setClients(prev => prev.map(client => {
          const healthResult = data.results.find(r => r.id === client.id);
          return healthResult ? { ...client, status: healthResult.status } : client;
        }));
      }
    } catch (err) {
      setError('Failed to check clients health');
    }
    setLoading(prev => ({ ...prev, clients: false }));
  };

  const fetchAllClientsData = async () => {
    setLoading(prev => ({ ...prev, data: true }));
    try {
      const response = await fetch(`${ADMIN_SERVER}/api/all-clients-data`);
      if (response.ok) {
        const data = await response.json();
        setClientsData(data.clients_data || []);
      }
    } catch (err) {
      setError('Failed to fetch clients data');
    }
    setLoading(prev => ({ ...prev, data: false }));
  };

  const fetchAllClientsMetrics = async () => {
    setLoading(prev => ({ ...prev, metrics: true }));
    try {
      const response = await fetch(`${ADMIN_SERVER}/api/all-clients-metrics`);
      if (response.ok) {
        const data = await response.json();
        setClientsMetrics(data.clients_metrics || []);
      }
    } catch (err) {
      setError('Failed to fetch clients metrics');
    }
    setLoading(prev => ({ ...prev, metrics: false }));
  };

  const fetchTrainingStatus = async () => {
    try {
      const response = await fetch(`${ADMIN_SERVER}/api/training/status`);
      if (response.ok) {
        const data = await response.json();
        setTrainingStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch training status');
    }
  };

  const startTraining = async () => {
    if (clients.length === 0) {
      setError('No clients registered. Add clients first.');
      return;
    }

    setLoading(prev => ({ ...prev, training: true }));
    try {
      const response = await fetch(`${ADMIN_SERVER}/api/training/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds: 5 })
      });

      if (response.ok) {
        fetchTrainingStatus();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to start training');
      }
    } catch (err) {
      setError('Failed to start training');
    }
    setLoading(prev => ({ ...prev, training: false }));
  };

  const tabs = [
    { id: 'clients', label: 'Clients', icon: Server },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'training', label: 'Training', icon: Cpu },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Federated Learning</h1>
            <p className="text-slate-400">Connect and aggregate data from multiple devices</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={checkClientsHealth}
            disabled={loading.clients}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading.clients ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <span className="text-red-400">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">Total Clients</span>
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white">{clients.length}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-slate-400">Registered devices</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">Online Clients</span>
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
              <Wifi className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white">
            {clients.filter(c => c.status === 'online').length}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-emerald-400">Connected & ready</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">Training Status</span>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${trainingStatus?.is_training ? 'from-amber-500 to-orange-600' : 'from-cyan-500 to-blue-600'}`}>
              <Cpu className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white">
            {trainingStatus?.is_training ? 'Active' : 'Idle'}
          </div>
          {trainingStatus?.is_training && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-amber-400">
                Round {trainingStatus.current_round}/{trainingStatus.total_rounds}
              </span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">Global Accuracy</span>
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white">
            {trainingStatus?.global_metrics?.accuracy 
              ? `${(trainingStatus.global_metrics.accuracy * 100).toFixed(1)}%`
              : '--'}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Federated model</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50">
        <div className="flex border-b border-slate-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              {/* Add Client Form */}
              <div className="bg-slate-800/30 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Register New Client</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="IP Address (e.g., 192.168.1.100)"
                    value={newClient.ip}
                    onChange={(e) => setNewClient({ ...newClient, ip: e.target.value })}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
                  />
                  <input
                    type="text"
                    placeholder="Port (default: 5001)"
                    value={newClient.port}
                    onChange={(e) => setNewClient({ ...newClient, port: e.target.value })}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
                  />
                  <input
                    type="text"
                    placeholder="Client ID (e.g., client_1)"
                    value={newClient.id}
                    onChange={(e) => setNewClient({ ...newClient, id: e.target.value })}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={addClient}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-all duration-200"
                  >
                    <Plus className="w-5 h-5" />
                    Add Client
                  </button>
                </div>
              </div>

              {/* Clients List */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Registered Clients ({clients.length})
                </h3>
                {clients.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No clients registered yet</p>
                    <p className="text-sm mt-2">Add client devices using their IP addresses</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.map((client) => {
                      const StatusIcon = getStatusIcon(client.status);
                      return (
                        <div
                          key={client.id}
                          className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                                <Server className="w-5 h-5 text-violet-400" />
                              </div>
                              <span className="font-semibold text-white">{client.id}</span>
                            </div>
                            <button
                              onClick={() => removeClient(client.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-slate-400">Address:</span>
                              <span className="text-white">{client.ip}:{client.port}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-4 h-4 ${getStatusColor(client.status).split(' ')[0]}`} />
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(client.status)}`}>
                                {client.status || 'unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Client Data Overview</h3>
                <button
                  onClick={fetchAllClientsData}
                  disabled={loading.data}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-all duration-200"
                >
                  <RefreshCw className={`w-4 h-4 ${loading.data ? 'animate-spin' : ''}`} />
                  {loading.data ? 'Fetching...' : 'Fetch All Data'}
                </button>
              </div>

              {clientsData.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No data fetched yet</p>
                  <p className="text-sm mt-2">Click "Fetch All Data" to retrieve data from clients</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {clientsData.map((data, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white">{data.client_id}</h4>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(data.connection_status)}`}>
                          {data.connection_status}
                        </span>
                      </div>
                      
                      {data.error ? (
                        <p className="text-red-400">{data.error}</p>
                      ) : (
                        <>
                          <div className="text-sm text-slate-400 mb-4">
                            Total Records: <span className="text-white font-medium">{data.total_records}</span>
                          </div>
                          
                          {data.statistics && (
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(data.statistics).map(([key, value]) => (
                                <div key={key} className="bg-slate-700/30 rounded-lg p-3">
                                  <div className="text-xs text-slate-400 capitalize">
                                    {key.replace('avg_', 'Avg ')}
                                  </div>
                                  <div className="text-lg font-semibold text-white">
                                    {typeof value === 'number' ? value.toFixed(2) : value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {data.quality_distribution && (
                            <div className="mt-4 pt-4 border-t border-slate-700/30">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-emerald-400">Safe: {data.quality_distribution.safe}</span>
                                <span className="text-red-400">Unsafe: {data.quality_distribution.unsafe}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Training Tab */}
          {activeTab === 'training' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Federated Training</h3>
                <button
                  onClick={startTraining}
                  disabled={loading.training || trainingStatus?.is_training}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    trainingStatus?.is_training
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:opacity-90'
                  }`}
                >
                  {trainingStatus?.is_training ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Training in Progress...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Federated Training
                    </>
                  )}
                </button>
              </div>

              {/* Training Progress */}
              {trainingStatus && (
                <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                  <h4 className="font-semibold text-white mb-4">Training Progress</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white">
                          {trainingStatus.current_round} / {trainingStatus.total_rounds} rounds
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${(trainingStatus.current_round / trainingStatus.total_rounds) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Status:</span>
                        <span className={`ml-2 ${trainingStatus.is_training ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {trainingStatus.is_training ? 'In Progress' : 'Completed'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Last Updated:</span>
                        <span className="ml-2 text-white">{trainingStatus.last_updated || '--'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Global Metrics */}
              {trainingStatus?.global_metrics && (
                <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                  <h4 className="font-semibold text-white mb-4">Global Model Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(trainingStatus.global_metrics).map(([key, value]) => (
                      <div key={key} className="bg-slate-700/30 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">
                          {(value * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-slate-400 capitalize mt-1">
                          {key.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fetch Client Metrics */}
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">Client Model Metrics</h4>
                  <button
                    onClick={fetchAllClientsMetrics}
                    disabled={loading.metrics}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-200"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading.metrics ? 'animate-spin' : ''}`} />
                    Fetch Metrics
                  </button>
                </div>

                {clientsMetrics.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left text-slate-400 text-sm font-medium pb-3">Client</th>
                          <th className="text-left text-slate-400 text-sm font-medium pb-3">Accuracy</th>
                          <th className="text-left text-slate-400 text-sm font-medium pb-3">Precision</th>
                          <th className="text-left text-slate-400 text-sm font-medium pb-3">Recall</th>
                          <th className="text-left text-slate-400 text-sm font-medium pb-3">F1 Score</th>
                          <th className="text-left text-slate-400 text-sm font-medium pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientsMetrics.map((metric, idx) => (
                          <tr key={idx} className="border-b border-slate-700/30">
                            <td className="py-3 text-white font-medium">{metric.client_id}</td>
                            <td className="py-3 text-white">
                              {metric.accuracy ? `${(metric.accuracy * 100).toFixed(1)}%` : '--'}
                            </td>
                            <td className="py-3 text-white">
                              {metric.precision ? `${(metric.precision * 100).toFixed(1)}%` : '--'}
                            </td>
                            <td className="py-3 text-white">
                              {metric.recall ? `${(metric.recall * 100).toFixed(1)}%` : '--'}
                            </td>
                            <td className="py-3 text-white">
                              {metric.f1_score ? `${(metric.f1_score * 100).toFixed(1)}%` : '--'}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(metric.connection_status)}`}>
                                {metric.connection_status || 'unknown'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-4">
                    Click "Fetch Metrics" to retrieve model metrics from all clients
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
