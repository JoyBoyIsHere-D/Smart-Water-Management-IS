import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Droplets, User, MapPin, Activity, Beaker, Thermometer,
  Gauge, TrendingUp, TrendingDown, Zap, AlertTriangle, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { getUserData, DUMMY_USERS } from '../../data/dummyData';

// ── colour helpers ──────────────────────────────────────────────────────────
const healthColor = (i) =>
  i >= 80 ? 'text-emerald-400' : i >= 60 ? 'text-blue-400' : i >= 40 ? 'text-amber-400' : 'text-red-400';
const healthBg = (i) =>
  i >= 80 ? 'from-emerald-500 to-emerald-600' : i >= 60 ? 'from-blue-500 to-blue-600' : i >= 40 ? 'from-amber-500 to-amber-600' : 'from-red-500 to-red-600';
const sevStyle = (s) =>
  s === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-400'
  : s === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
  : 'bg-blue-500/10 border-blue-500/30 text-blue-400';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function UserDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  // Resolve dummy data – match by unique_id if available, else first user
  const uid = user.unique_id || DUMMY_USERS[0].unique_id;
  const d = getUserData(uid);
  const latest = d.latest;
  const pie = Object.entries(d.qualityBreakdown).map(([k, v]) => ({ name: k, value: v }));

  // Weekly consumption dummy bars
  const weekBars = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    day,
    litres: Math.floor(80 + Math.random() * 100),
  }));

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {user.full_name}</h1>
        <p className="text-slate-400 mt-0.5 flex items-center gap-1 text-sm">
          <MapPin className="w-3.5 h-3.5" /> {d.user.area} &mdash; Live sensor readings for your area
        </p>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Health Index */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-400 text-sm font-medium">Health Index</h3>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${healthBg(d.healthIndex)}`}>
                <Activity className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className={`text-4xl font-bold ${healthColor(d.healthIndex)}`}>{d.healthIndex}</span>
            <span className="text-slate-500 text-sm ml-1">/100</span>
            <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${healthBg(d.healthIndex)} transition-all`} style={{ width: `${d.healthIndex}%` }} />
            </div>
          </div>

          {/* pH */}
          <KpiCard title="pH Level" value={latest.pH} icon={Beaker} gradient="from-purple-500 to-purple-600" trend="Normal range" trendIcon={TrendingUp} trendColor="text-emerald-400" />
          {/* Temperature */}
          <KpiCard title="Temperature" value={latest.temperature} unit="°C" icon={Thermometer} gradient="from-orange-500 to-red-500" trend="-0.3°C from avg" trendIcon={TrendingDown} trendColor="text-cyan-400" />
          {/* Flow Rate */}
          <KpiCard title="Flow Rate" value={latest.flowRate} unit="L/min" icon={Gauge} gradient="from-cyan-500 to-blue-500" trend="Peak usage" trendIcon={Zap} trendColor="text-amber-400" />
        </div>

        {/* ── Charts Row 1 ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sensor Time-Series */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Sensor Readings (24 h)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={d.series}>
                <defs>
                  <linearGradient id="uPh" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                  <linearGradient id="uTurb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
                <Legend />
                <Area type="monotone" dataKey="pH" stroke="#8b5cf6" fill="url(#uPh)" strokeWidth={2} />
                <Area type="monotone" dataKey="turbidity" stroke="#06b6d4" fill="url(#uTurb)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Water Quality Breakdown */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-white mb-2 self-start">Quality Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Charts Row 2 ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Consumption */}
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

          {/* Anomaly Alerts */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Anomaly Alerts</h3>
              <span className="px-2.5 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                {d.anomalies.length} Active
              </span>
            </div>
            <div className="space-y-3">
              {d.anomalies.map((a) => (
                <div key={a.id} className={`p-3 rounded-xl border ${sevStyle(a.severity)}`}>
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
    </div>
  );
}

/* ── small reusable KPI card ──────────────────────────────────────────────── */
function KpiCard({ title, value, unit, icon: Icon, gradient, trend, trendIcon: TIcon, trendColor }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}><Icon className="w-4 h-4 text-white" /></div>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-white">{value}</span>
        {unit && <span className="text-slate-400 mb-0.5 text-sm">{unit}</span>}
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <TIcon className={`w-3.5 h-3.5 ${trendColor}`} />
        <span className={`text-xs ${trendColor}`}>{trend}</span>
      </div>
    </div>
  );
}
