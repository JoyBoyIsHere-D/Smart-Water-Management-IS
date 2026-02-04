import { useState, useEffect } from 'react';
import { 
  Network, Server, Activity, Play, RefreshCw, Plus, Trash2, 
  CheckCircle, XCircle, Clock, Wifi, WifiOff, Database,
  TrendingUp, Users, Cpu, BarChart3, Download, Brain, 
  Settings, StopCircle, History, Beaker, AlertTriangle
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
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [dataStats, setDataStats] = useState(null);
  const [loading, setLoading] = useState({ 
    clients: false, data: false, metrics: false, training: false, 
    model: false, stats: false, prediction: false 
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('clients');
  
  // Training configuration
  const [trainingConfig, setTrainingConfig] = useState({
    rounds: 5,
    epochs_per_round: 20,
    batch_size: 32,
    num_clients: 5
  });
  
  // Prediction form
  const [predictionInput, setPredictionInput] = useState({
    pressure_bar: 2.5,
    flow_rate_L_min: 15,
    total_volume_L: 1000,
    tds_ppm: 300,
    ph: 7.2,
    temperature_C: 25,
    signal_strength_dBm: -50
  });
  const [predictionResult, setPredictionResult] = useState(null);

  useEffect(() => {
    fetchClients();
    fetchTrainingStatus();
    fetchModelInfo();
    fetchDataStats();
  }, []);

  // Poll training status when training is active
  useEffect(() => {
    let interval;
    if (trainingStatus?.is_training) {
      interval = setInterval(() => {
        fetchTrainingStatus();
        fetchTrainingHistory();
      }, 2000);
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
        // Clear the form first
        setNewClient({ ip: '', port: '5001', id: '' });
        setError(null);
        // Refresh the client list to ensure UI is up to date
        await fetchClients();
      } else {
        setError(data.detail || data.error || 'Failed to add client');
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
    setError(null);
    try {
      const response = await fetch(`${ADMIN_SERVER}/api/all-clients-data`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched clients data:', data);
        setClientsData(data.clients_data || []);
        if (data.clients_data?.length === 0) {
          setError('No clients registered. Add clients first in the Clients tab.');
        }
      } else {
        setError(`Server error: ${response.status}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch clients data. Make sure admin server is running.');
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

  const fetchTrainingHistory = async () => {
    try {
      const response = await fetch(`${ADMIN_SERVER}/api/training/history`);
      if (response.ok) {
        const data = await response.json();
        setTrainingHistory(data.round_history || []);
      }
    } catch (err) {
      console.error('Failed to fetch training history');
    }
  };

  const fetchModelInfo = async () => {
    setLoading(prev => ({ ...prev, model: true }));
    try {
      const response = await fetch(`${ADMIN_SERVER}/api/model/info`);
      if (response.ok) {
        const data = await response.json();
        setModelInfo(data);
      }
    } catch (err) {
      console.error('Failed to fetch model info');
    }
    setLoading(prev => ({ ...prev, model: false }));
  };

  const fetchDataStats = async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const response = await fetch(`${ADMIN_SERVER}/api/data/statistics`);
      if (response.ok) {
        const data = await response.json();
        setDataStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch data statistics');
    }
    setLoading(prev => ({ ...prev, stats: false }));
  };

  const startTraining = async () => {
    setLoading(prev => ({ ...prev, training: true }));
    setError(null);
    try {
      const response = await fetch(`${ADMIN_SERVER}/api/training/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingConfig)
      });

      if (response.ok) {
        fetchTrainingStatus();
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to start training');
      }
    } catch (err) {
      setError('Failed to start training');
    }
    setLoading(prev => ({ ...prev, training: false }));
  };

  const stopTraining = async () => {
    try {
      const response = await fetch(`${ADMIN_SERVER}/api/training/stop`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchTrainingStatus();
      }
    } catch (err) {
      setError('Failed to stop training');
    }
  };

  const downloadModel = () => {
    window.open(`${ADMIN_SERVER}/api/model/download`, '_blank');
  };

  const makePrediction = async () => {
    setLoading(prev => ({ ...prev, prediction: true }));
    setPredictionResult(null);
    try {
      const response = await fetch(`${ADMIN_SERVER}/api/model/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictionInput)
      });

      if (response.ok) {
        const data = await response.json();
        setPredictionResult(data);
      } else {
        const data = await response.json();
        setError(data.detail || 'Prediction failed');
      }
    } catch (err) {
      setError('Failed to make prediction');
    }
    setLoading(prev => ({ ...prev, prediction: false }));
  };

  const tabs = [
    { id: 'clients', label: 'Clients', icon: Server },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'training', label: 'Training', icon: Cpu },
    { id: 'model', label: 'Model', icon: Brain },
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
              {/* Training Configuration */}
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  Training Configuration
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Rounds</label>
                    <input
                      type="number"
                      value={trainingConfig.rounds}
                      onChange={(e) => setTrainingConfig({ ...trainingConfig, rounds: parseInt(e.target.value) || 5 })}
                      disabled={trainingStatus?.is_training}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Epochs/Round</label>
                    <input
                      type="number"
                      value={trainingConfig.epochs_per_round}
                      onChange={(e) => setTrainingConfig({ ...trainingConfig, epochs_per_round: parseInt(e.target.value) || 20 })}
                      disabled={trainingStatus?.is_training}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Batch Size</label>
                    <input
                      type="number"
                      value={trainingConfig.batch_size}
                      onChange={(e) => setTrainingConfig({ ...trainingConfig, batch_size: parseInt(e.target.value) || 32 })}
                      disabled={trainingStatus?.is_training}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Num Clients</label>
                    <input
                      type="number"
                      value={trainingConfig.num_clients}
                      onChange={(e) => setTrainingConfig({ ...trainingConfig, num_clients: parseInt(e.target.value) || 5 })}
                      disabled={trainingStatus?.is_training}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {trainingStatus?.is_training ? (
                    <button
                      onClick={stopTraining}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-medium hover:bg-red-500/30 transition-all duration-200"
                    >
                      <StopCircle className="w-5 h-5" />
                      Stop Training
                    </button>
                  ) : (
                    <button
                      onClick={startTraining}
                      disabled={loading.training}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium hover:opacity-90 transition-all duration-200"
                    >
                      <Play className="w-5 h-5" />
                      Start Federated Training
                    </button>
                  )}
                  
                  <button
                    onClick={fetchTrainingHistory}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-all duration-200"
                  >
                    <History className="w-5 h-5" />
                    Load History
                  </button>
                </div>
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <span className="text-slate-400 block">Status</span>
                        <span className={`font-medium ${trainingStatus.is_training ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {trainingStatus.is_training ? 'In Progress' : 'Completed'}
                        </span>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <span className="text-slate-400 block">Last Updated</span>
                        <span className="text-white font-medium">{trainingStatus.last_updated || '--'}</span>
                      </div>
                      {trainingStatus.config && (
                        <>
                          <div className="bg-slate-700/30 rounded-lg p-3">
                            <span className="text-slate-400 block">Epochs/Round</span>
                            <span className="text-white font-medium">{trainingStatus.config.epochs_per_round}</span>
                          </div>
                          <div className="bg-slate-700/30 rounded-lg p-3">
                            <span className="text-slate-400 block">Batch Size</span>
                            <span className="text-white font-medium">{trainingStatus.config.batch_size}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Global Metrics */}
              {trainingStatus?.global_metrics && (
                <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                  <h4 className="font-semibold text-white mb-4">Global Model Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(trainingStatus.global_metrics).map(([key, value]) => (
                      <div key={key} className="bg-slate-700/30 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">
                          {key === 'loss' || key === 'total_test_samples' 
                            ? (typeof value === 'number' ? value.toFixed(4) : value)
                            : `${(value * 100).toFixed(1)}%`}
                        </div>
                        <div className="text-sm text-slate-400 capitalize mt-1">
                          {key.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Training History */}
              {trainingHistory.length > 0 && (
                <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-cyan-400" />
                    Training History ({trainingHistory.length} rounds)
                  </h4>
                  <div className="space-y-3">
                    {trainingHistory.map((round, idx) => (
                      <div key={idx} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">Round {round.round}</span>
                          <span className="text-sm text-slate-400">{round.timestamp}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Accuracy:</span>
                            <span className="ml-2 text-emerald-400">
                              {(round.average_metrics?.accuracy * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Precision:</span>
                            <span className="ml-2 text-cyan-400">
                              {(round.average_metrics?.precision * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Recall:</span>
                            <span className="ml-2 text-blue-400">
                              {(round.average_metrics?.recall * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">F1:</span>
                            <span className="ml-2 text-violet-400">
                              {(round.average_metrics?.f1_score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client Metrics Table */}
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

          {/* Model Tab */}
          {activeTab === 'model' && (
            <div className="space-y-6">
              {/* Model Info */}
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    Model Information
                  </h3>
                  <button
                    onClick={fetchModelInfo}
                    disabled={loading.model}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-all duration-200"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading.model ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {modelInfo ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-sm text-slate-400">Model Status</div>
                      <div className={`text-lg font-medium ${modelInfo.model_exists ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {modelInfo.model_exists ? 'Available' : 'Not Trained'}
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-sm text-slate-400">TensorFlow</div>
                      <div className={`text-lg font-medium ${modelInfo.tensorflow_available ? 'text-emerald-400' : 'text-red-400'}`}>
                        {modelInfo.tensorflow_available ? 'Available' : 'Not Available'}
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-sm text-slate-400">Features</div>
                      <div className="text-lg font-medium text-white">{modelInfo.features_count || '--'}</div>
                    </div>
                    {modelInfo.model_summary && (
                      <>
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <div className="text-sm text-slate-400">Layers</div>
                          <div className="text-lg font-medium text-white">{modelInfo.model_summary.layers}</div>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <div className="text-sm text-slate-400">Parameters</div>
                          <div className="text-lg font-medium text-white">
                            {modelInfo.model_summary.total_params?.toLocaleString()}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Loading model information...</p>
                  </div>
                )}

                {modelInfo?.model_exists && (
                  <button
                    onClick={downloadModel}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-all duration-200"
                  >
                    <Download className="w-5 h-5" />
                    Download Model (.h5)
                  </button>
                )}
              </div>

              {/* Data Statistics */}
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Dataset Statistics
                  </h3>
                  <button
                    onClick={fetchDataStats}
                    disabled={loading.stats}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-all duration-200"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading.stats ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {dataStats ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="text-sm text-slate-400">Total Records</div>
                        <div className="text-2xl font-bold text-white">{dataStats.total_records?.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="text-sm text-slate-400">Safe Samples</div>
                        <div className="text-2xl font-bold text-emerald-400">{dataStats.safe_count?.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="text-sm text-slate-400">Unsafe Samples</div>
                        <div className="text-2xl font-bold text-red-400">{dataStats.unsafe_count?.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="text-sm text-slate-400">Unsafe %</div>
                        <div className="text-2xl font-bold text-amber-400">{dataStats.unsafe_percentage?.toFixed(2)}%</div>
                      </div>
                    </div>

                    {dataStats.numerical_stats && (
                      <div>
                        <h4 className="text-white font-medium mb-3">Feature Statistics</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-700/50">
                                <th className="text-left text-slate-400 font-medium pb-2">Feature</th>
                                <th className="text-left text-slate-400 font-medium pb-2">Mean</th>
                                <th className="text-left text-slate-400 font-medium pb-2">Std</th>
                                <th className="text-left text-slate-400 font-medium pb-2">Min</th>
                                <th className="text-left text-slate-400 font-medium pb-2">Max</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(dataStats.numerical_stats).map(([feature, stats]) => (
                                <tr key={feature} className="border-b border-slate-700/30">
                                  <td className="py-2 text-white">{feature}</td>
                                  <td className="py-2 text-slate-300">{stats.mean?.toFixed(2)}</td>
                                  <td className="py-2 text-slate-300">{stats.std?.toFixed(2)}</td>
                                  <td className="py-2 text-slate-300">{stats.min?.toFixed(2)}</td>
                                  <td className="py-2 text-slate-300">{stats.max?.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Loading dataset statistics...</p>
                  </div>
                )}
              </div>

              {/* Prediction */}
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-cyan-400" />
                  Make Prediction
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Pressure (bar)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionInput.pressure_bar}
                      onChange={(e) => setPredictionInput({ ...predictionInput, pressure_bar: parseFloat(e.target.value) })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Flow Rate (L/min)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionInput.flow_rate_L_min}
                      onChange={(e) => setPredictionInput({ ...predictionInput, flow_rate_L_min: parseFloat(e.target.value) })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">TDS (ppm)</label>
                    <input
                      type="number"
                      value={predictionInput.tds_ppm}
                      onChange={(e) => setPredictionInput({ ...predictionInput, tds_ppm: parseFloat(e.target.value) })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">pH</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionInput.ph}
                      onChange={(e) => setPredictionInput({ ...predictionInput, ph: parseFloat(e.target.value) })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionInput.temperature_C}
                      onChange={(e) => setPredictionInput({ ...predictionInput, temperature_C: parseFloat(e.target.value) })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Total Volume (L)</label>
                    <input
                      type="number"
                      value={predictionInput.total_volume_L}
                      onChange={(e) => setPredictionInput({ ...predictionInput, total_volume_L: parseFloat(e.target.value) })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Signal (dBm)</label>
                    <input
                      type="number"
                      value={predictionInput.signal_strength_dBm}
                      onChange={(e) => setPredictionInput({ ...predictionInput, signal_strength_dBm: parseFloat(e.target.value) })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <button
                  onClick={makePrediction}
                  disabled={loading.prediction || !modelInfo?.model_exists}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50"
                >
                  {loading.prediction ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Beaker className="w-5 h-5" />
                  )}
                  Predict Water Quality
                </button>

                {/* Prediction Result */}
                {predictionResult && (
                  <div className={`mt-6 p-6 rounded-xl border ${
                    predictionResult.prediction === 'Safe' 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-4 mb-4">
                      {predictionResult.prediction === 'Safe' ? (
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-10 h-10 text-red-400" />
                      )}
                      <div>
                        <div className={`text-2xl font-bold ${
                          predictionResult.prediction === 'Safe' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {predictionResult.prediction}
                        </div>
                        <div className="text-sm text-slate-400">
                          Risk Level: <span className={
                            predictionResult.risk_level === 'Low' ? 'text-emerald-400' :
                            predictionResult.risk_level === 'Medium' ? 'text-amber-400' : 'text-red-400'
                          }>{predictionResult.risk_level}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-sm text-slate-400">Safe Probability</div>
                        <div className="text-lg font-bold text-emerald-400">
                          {(predictionResult.safe_probability * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-sm text-slate-400">Unsafe Probability</div>
                        <div className="text-lg font-bold text-red-400">
                          {(predictionResult.unsafe_probability * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    {predictionResult.simulated && (
                      <div className="mt-3 text-xs text-amber-400">
                        ⚠️ Simulated prediction (TensorFlow not available on server)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
