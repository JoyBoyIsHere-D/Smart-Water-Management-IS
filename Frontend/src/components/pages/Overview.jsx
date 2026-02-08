import { useState } from 'react';
import {
  Activity, Beaker, Thermometer, Gauge, TrendingUp, TrendingDown,
  Zap, Users, Droplets, AlertTriangle, ChevronDown, MapPin, Clock,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { DUMMY_USERS, USER_SENSOR_DATA, getMasterDashboard, getUserData } from '../../data/dummyData';

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
  const [view, setView] = useState('master'); // 'master' | unique_id
  const master = getMasterDashboard();

  const selectedUser = view !== 'master' ? getUserData(view) : null;

  return (
    <div className="p-6 space-y-6">
      {/* ── View Switcher ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {view === 'master' ? 'Master Dashboard' : `${selectedUser.user.full_name}'s Dashboard`}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {view === 'master'
              ? 'Aggregated overview of all registered users'
              : `${selectedUser.user.area}`}
          </p>
        </div>

        <div className="relative">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="master">🏠 Master Dashboard</option>
            {DUMMY_USERS.map((u) => (
              <option key={u.unique_id} value={u.unique_id}>
                👤 {u.full_name} — {u.area}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Conditionally render Master or Individual ───────── */}
      {view === 'master' ? <MasterView data={master} onSelect={setView} /> : <IndividualView data={selectedUser} />}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MasterKpi icon={Users} gradient="from-cyan-500 to-blue-600" title="Total Users" value={data.totalUsers} />
        <MasterKpi icon={Activity} gradient={hBg(data.avgHealth)} title="Avg Health Index" value={data.avgHealth} sub="/100" />
        <MasterKpi icon={Droplets} gradient="from-violet-500 to-purple-600" title="Total Consumption" value={`${(data.totalConsumption / 1000).toFixed(1)}k`} sub="L/month" />
        <MasterKpi icon={AlertTriangle} gradient="from-red-500 to-rose-600" title="Active Anomalies" value={data.totalAnomalies} />
      </div>

      {/* Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SmallKpi title="Avg pH" value={data.avgPh} icon={Beaker} gradient="from-purple-500 to-purple-600" />
        <SmallKpi title="Avg Turbidity" value={data.avgTurbidity} unit="NTU" icon={Gauge} gradient="from-cyan-500 to-blue-500" />
        <SmallKpi title="Avg Temperature" value={data.avgTemp} unit="°C" icon={Thermometer} gradient="from-orange-500 to-red-500" />
      </div>

      {/* User Summary Table */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">User Overview</h3>
          <span className="text-xs text-slate-400">{data.userSummaries.length} users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-700/20">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Area</th>
                <th className="px-5 py-3">Health</th>
                <th className="px-5 py-3">pH</th>
                <th className="px-5 py-3">Turbidity</th>
                <th className="px-5 py-3">Consumption</th>
                <th className="px-5 py-3">Anomalies</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {data.userSummaries.map((u) => (
                <tr key={u.unique_id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-white font-medium">{u.name}</p>
                    <p className="text-xs text-cyan-400 font-mono">{u.unique_id}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-300 text-xs">{u.area}</td>
                  <td className="px-5 py-3">
                    <span className={`font-semibold ${hColor(u.healthIndex)}`}>{u.healthIndex}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-300">{u.pH}</td>
                  <td className="px-5 py-3 text-slate-300">{u.turbidity}</td>
                  <td className="px-5 py-3 text-slate-300">{u.consumption} L</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${u.anomalies > 0 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                      {u.anomalies}
                    </span>
                  </td>
                  <td className="px-5 py-3">
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
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Consumption Comparison</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.userSummaries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="unique_id" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-400 text-sm">Health Index</h3>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${hBg(d.healthIndex)}`}><Activity className="w-4 h-4 text-white" /></div>
          </div>
          <span className={`text-4xl font-bold ${hColor(d.healthIndex)}`}>{d.healthIndex}</span>
          <span className="text-slate-500 text-sm ml-1">/100</span>
          <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${hBg(d.healthIndex)}`} style={{ width: `${d.healthIndex}%` }} />
          </div>
        </div>
        <SmallKpi title="pH Level" value={latest.pH} icon={Beaker} gradient="from-purple-500 to-purple-600" />
        <SmallKpi title="Temperature" value={latest.temperature} unit="°C" icon={Thermometer} gradient="from-orange-500 to-red-500" />
        <SmallKpi title="Flow Rate" value={latest.flowRate} unit="L/min" icon={Gauge} gradient="from-cyan-500 to-blue-500" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sensor Readings (24 h)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={d.series}>
              <defs>
                <linearGradient id="aPh" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                <linearGradient id="aTurb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
              <Legend />
              <Area type="monotone" dataKey="pH" stroke="#8b5cf6" fill="url(#aPh)" strokeWidth={2} />
              <Area type="monotone" dataKey="turbidity" stroke="#06b6d4" fill="url(#aTurb)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-white mb-2 self-start">Quality Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Consumption</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="litres" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center gap-6 text-sm text-slate-400">
            <span>Monthly: <strong className="text-white">{d.monthlyConsumption} L</strong></span>
            <span>Daily Avg: <strong className="text-white">{d.dailyAvgConsumption} L</strong></span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Anomaly Alerts</h3>
            <span className="px-2.5 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">{d.anomalies.length} Active</span>
          </div>
          <div className="space-y-3">
            {d.anomalies.map((a) => (
              <div key={a.id} className={`p-3 rounded-xl border ${sevBadge(a.severity)}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{a.type}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs opacity-80">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.sensor}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.time}</span>
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
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}><Icon className="w-4 h-4 text-white" /></div>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-white">{value}</span>
        {sub && <span className="text-slate-400 mb-0.5 text-sm">{sub}</span>}
      </div>
    </div>
  );
}

function SmallKpi({ title, value, unit, icon: Icon, gradient }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-400 text-sm">{title}</h3>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}><Icon className="w-4 h-4 text-white" /></div>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-white">{value}</span>
        {unit && <span className="text-slate-400 mb-0.5 text-sm">{unit}</span>}
      </div>
    </div>
  );
}
