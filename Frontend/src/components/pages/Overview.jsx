import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Activity, Beaker, Thermometer, Gauge, TrendingUp, TrendingDown,
  Zap, Users, Droplets, AlertTriangle, ChevronDown, MapPin, Clock,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import {
  getMasterDashboardWithAPI,
  getUserDataWithAPI,
  fetchPortalUsers,
  getEmptyMasterDashboard,
  getEmptyUserData
} from '../../data/dummyData';

// ── colour / style helpers ──────────────────────────────────────────────────
const hColor = (i) =>
  i >= 80 ? 'text-emerald-400' : i >= 60 ? 'text-blue-400' : i >= 40 ? 'text-amber-400' : 'text-red-400';
const hBg = (i) =>
  i >= 80 ? 'from-emerald-500 to-emerald-600' : i >= 60 ? 'from-blue-500 to-blue-600' : i >= 40 ? 'from-amber-500 to-amber-600' : 'from-red-500 to-red-600';
const sevBadge = (s) =>
  s === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30'
  : s === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  : 'bg-blue-500/10 text-blue-400 border-blue-500/30';
const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function Overview() {
  const { user } = useAuth();
  const [view, setView] = useState('master'); // 'master' | unique_id
  const [masterData, setMasterData] = useState(null);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [portalUsers, setPortalUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch portal users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await fetchPortalUsers();
        setPortalUsers(users);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setPortalUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // Fetch dashboard data when view changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (view === 'master') {
          const data = await getMasterDashboardWithAPI(user);
          setMasterData(data);
          setSelectedUserData(null);
        } else {
          // Find user info for the selected unique_id
          const userInfo = portalUsers.find(u => u.unique_id === view);
          const data = await getUserDataWithAPI(view, userInfo);
          setSelectedUserData(data);
          setMasterData(null);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message);
        if (view === 'master') {
          setMasterData(getEmptyMasterDashboard());
        } else {
          setSelectedUserData(getEmptyUserData(view));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [view, portalUsers]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* ── View Switcher ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
            {view === 'master' ? 'Master Dashboard' : `${selectedUserData?.user?.full_name || view}'s Dashboard`}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            {view === 'master'
              ? 'Aggregated overview of all registered users'
              : `${selectedUserData?.user?.area || 'Unknown Area'}`}
          </p>
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="master">Master Dashboard</option>
            {portalUsers.map((u) => (
              <option key={u.unique_id} value={u.unique_id}>
                {u.full_name} — {u.area}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          Error loading data: {error}
        </div>
      )}

      {/* ── Conditionally render Master or Individual ───────── */}
      {view === 'master' ? (
        masterData ? <MasterView data={masterData} onSelect={setView} /> : <div>Loading master data...</div>
      ) : (
        selectedUserData ? <IndividualView data={selectedUserData} /> : <div>Loading user data...</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MASTER DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
function MasterView({ data, onSelect }) {
  return (
    <>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <MasterKpi icon={Users} gradient="from-cyan-500 to-blue-600" title="Total Users" value={data.totalUsers} />
        <MasterKpi icon={Activity} gradient={hBg(data.avgHealth)} title="Avg Health Index" value={data.avgHealth} sub="/100" />
        <MasterKpi icon={Droplets} gradient="from-violet-500 to-purple-600" title="Total Consumption" value={`${(data.totalConsumption / 1000).toFixed(1)}k`} sub="L/month" />
        <MasterKpi icon={AlertTriangle} gradient="from-red-500 to-rose-600" title="Active Anomalies" value={data.totalAnomalies} />
      </div>

      {/* Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        <SmallKpi title="Avg pH" value={data.avgPh} icon={Beaker} gradient="from-purple-500 to-purple-600" />
        <SmallKpi title="Avg Flow Rate" value={data.avgFlowRate} unit="L/min" icon={Gauge} gradient="from-cyan-500 to-blue-500" />
        <SmallKpi title="Avg Temperature" value={data.avgTemp} unit="°C" icon={Thermometer} gradient="from-orange-500 to-red-500" />
      </div>

      {/* User Summary - Cards on mobile, Table on desktop */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-white">User Overview</h3>
          <span className="text-xs text-slate-400">{data.userSummaries.length} users</span>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-3 space-y-3">
          {data.userSummaries.map((u) => (
            <div key={u.unique_id} className="bg-slate-700/30 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-medium">{u.name}</p>
                  <p className="text-xs text-cyan-400 font-mono">{u.unique_id}</p>
                  <p className="text-xs text-slate-400 mt-1">{u.area}</p>
                </div>
                <button onClick={() => onSelect(u.unique_id)} className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-medium hover:bg-cyan-500/30 transition-colors">
                  View
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400 text-xs">Health</span>
                  <p className={`font-semibold ${hColor(u.healthIndex)}`}>{u.healthIndex}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">pH</span>
                  <p className="text-slate-300">{u.pH}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Flow Rate</span>
                  <p className="text-slate-300">{u.flowRate}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Consumption</span>
                  <p className="text-slate-300">{u.consumption} L</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-600/50">
                <span className="text-xs text-slate-400">Anomalies</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${u.anomalies > 0 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                  {u.anomalies}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-700/20">
              <tr>
                <th className="px-4 lg:px-5 py-3">User</th>
                <th className="px-4 lg:px-5 py-3">Area</th>
                <th className="px-4 lg:px-5 py-3">Health</th>
                <th className="px-4 lg:px-5 py-3">pH</th>
                <th className="px-4 lg:px-5 py-3">Flow Rate</th>
                <th className="px-4 lg:px-5 py-3">Consumption</th>
                <th className="px-4 lg:px-5 py-3">Anomalies</th>
                <th className="px-4 lg:px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {data.userSummaries.map((u) => (
                <tr key={u.unique_id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 lg:px-5 py-3">
                    <p className="text-white font-medium">{u.name}</p>
                    <p className="text-xs text-cyan-400 font-mono">{u.unique_id}</p>
                  </td>
                  <td className="px-4 lg:px-5 py-3 text-slate-300 text-xs">{u.area}</td>
                  <td className="px-4 lg:px-5 py-3">
                    <span className={`font-semibold ${hColor(u.healthIndex)}`}>{u.healthIndex}</span>
                  </td>
                  <td className="px-4 lg:px-5 py-3 text-slate-300">{u.pH}</td>
                  <td className="px-4 lg:px-5 py-3 text-slate-300">{u.flowRate}</td>
                  <td className="px-4 lg:px-5 py-3 text-slate-300">{u.consumption} L</td>
                  <td className="px-4 lg:px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${u.anomalies > 0 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                      {u.anomalies}
                    </span>
                  </td>
                  <td className="px-4 lg:px-5 py-3">
                    <button onClick={() => onSelect(u.unique_id)} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-xs">
                      View <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consumption comparison bar chart */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Monthly Consumption Comparison</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.userSummaries} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="unique_id" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
            <Bar dataKey="consumption" name="Consumption (L)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INDIVIDUAL USER VIEW (admin inspecting a specific user)
   ═══════════════════════════════════════════════════════════════════════════ */
function IndividualView({ data: d }) {
  const latest = d.latest;
  const pie = Object.entries(d.qualityBreakdown).map(([k, v]) => ({ name: k, value: v }));
  const weekBars = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    day, litres: Math.floor(80 + Math.random() * 100),
  }));

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-slate-400 text-xs sm:text-sm">Health Index</h3>
            <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${hBg(d.healthIndex)}`}><Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /></div>
          </div>
          <span className={`text-2xl sm:text-4xl font-bold ${hColor(d.healthIndex)}`}>{d.healthIndex}</span>
          <span className="text-slate-500 text-xs sm:text-sm ml-1">/100</span>
          <div className="mt-2 sm:mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${hBg(d.healthIndex)}`} style={{ width: `${d.healthIndex}%` }} />
          </div>
        </div>
        <SmallKpi title="pH Level" value={latest.pH} icon={Beaker} gradient="from-purple-500 to-purple-600" />
        <SmallKpi title="Temperature" value={latest.temperature} unit="°C" icon={Thermometer} gradient="from-orange-500 to-red-500" />
        <SmallKpi title="Flow Rate" value={latest.flowRate} unit="L/min" icon={Gauge} gradient="from-cyan-500 to-blue-500" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Sensor Readings (24 h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={d.series} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="aPh" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                <linearGradient id="aFlowRate" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="pH" stroke="#8b5cf6" fill="url(#aPh)" strokeWidth={2} />
              <Area type="monotone" dataKey="flowRate" stroke="#06b6d4" fill="url(#aFlowRate)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-4 sm:p-6 flex flex-col items-center">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2 self-start">Quality Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Weekly Consumption</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekBars} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="litres" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-sm text-slate-400">
            <span>Monthly: <strong className="text-white">{d.monthlyConsumption} L</strong></span>
            <span>Daily Avg: <strong className="text-white">{d.dailyAvgConsumption} L</strong></span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Anomaly Alerts</h3>
            <span className="px-2 sm:px-2.5 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">{d.anomalies.length} Active</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {d.anomalies.map((a) => (
              <div key={a.id} className={`p-3 rounded-xl border ${sevBadge(a.severity)}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{a.type}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs opacity-80">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{a.sensor}</span></span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 flex-shrink-0" />{a.time}</span>
                    </div>
                  </div>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── reusable cards ──────────────────────────────────────────────────────── */
function MasterKpi({ icon: Icon, gradient, title, value, sub }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-slate-400 text-xs sm:text-sm font-medium truncate pr-2">{title}</h3>
        <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${gradient} flex-shrink-0`}><Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /></div>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl sm:text-3xl font-bold text-white">{value}</span>
        {sub && <span className="text-slate-400 mb-0.5 text-xs sm:text-sm">{sub}</span>}
      </div>
    </div>
  );
}

function SmallKpi({ title, value, unit, icon: Icon, gradient }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-slate-400 text-xs sm:text-sm">{title}</h3>
        <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${gradient}`}><Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /></div>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl sm:text-3xl font-bold text-white">{value}</span>
        {unit && <span className="text-slate-400 mb-0.5 text-xs sm:text-sm">{unit}</span>}
      </div>
    </div>
  );
}
