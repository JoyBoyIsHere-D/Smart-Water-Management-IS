import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart3, LineChart, TrendingUp, TrendingDown, Calendar,
  Activity, Droplets, Thermometer, Gauge, MapPin,
} from 'lucide-react';
import {
  LineChart as ReLineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { getUserData, DUMMY_USERS } from '../../data/dummyData';

export default function UserAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d'); // '24h' | '7d' | '30d'

  if (!user) return null;

  const uid = user.unique_id || DUMMY_USERS[0].unique_id;
  const d = getUserData(uid);
  const latest = d.latest;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-1 text-sm">
            <MapPin className="w-3.5 h-3.5" /> {d.user.area} — Detailed insights and trends
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div className="flex gap-2">
            {[
              { label: '24 Hours', value: '24h' },
              { label: '7 Days', value: '7d' },
              { label: '30 Days', value: '30d' },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range.value
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-700/30 text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AnalyticsKpi
          label="Avg Daily Usage"
          value={d.dailyAvgConsumption}
          unit="L/day"
          trend="+5.2%"
          trendUp={false}
          icon={Droplets}
          gradient="from-cyan-500 to-blue-500"
        />
        <AnalyticsKpi
          label="Peak Hour"
          value="8:00"
          unit="AM"
          trend="Consistent"
          trendUp={true}
          icon={Activity}
          gradient="from-purple-500 to-pink-500"
        />
        <AnalyticsKpi
          label="Avg pH"
          value={latest.pH}
          unit=""
          trend="Within range"
          trendUp={true}
          icon={Gauge}
          gradient="from-emerald-500 to-teal-500"
        />
        <AnalyticsKpi
          label="Quality Score"
          value={d.healthIndex}
          unit="/100"
          trend="+2 pts"
          trendUp={true}
          icon={TrendingUp}
          gradient="from-amber-500 to-orange-500"
        />
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* pH & Turbidity Trend */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-purple-400" />
            Water Quality Trends
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <ReLineChart data={d.series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 12,
                  color: '#fff',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="pH" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="turbidity" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>

        {/* Temperature & Flow Rate */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-orange-400" />
            Temperature & Flow Rate
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <ReLineChart data={d.series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 12,
                  color: '#fff',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="flowRate" stroke="#10b981" strokeWidth={2} dot={false} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Consumption with Moving Average */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Consumption Trend with Moving Average
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={d.series}>
            <defs>
              <linearGradient id="consumptionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 12,
                color: '#fff',
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="consumption" stroke="#06b6d4" fill="url(#consumptionGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly Usage Pattern Heatmap */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Hourly Usage Pattern (This Week)</h3>
        <div className="overflow-x-auto">
          <div className="inline-grid grid-cols-25 gap-1 min-w-max">
            {/* Header */}
            <div className="text-xs text-slate-400 p-2"></div>
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="text-xs text-slate-400 text-center p-1 w-7">
                {h.toString().padStart(2, '0')}
              </div>
            ))}
            {/* Heatmap rows */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, di) => (
              <>
                <div key={`${day}-label`} className="text-xs text-slate-400 p-2 flex items-center">
                  {day}
                </div>
                {Array.from({ length: 24 }).map((_, h) => {
                  const intensity = Math.random() * 10;
                  return (
                    <div
                      key={`${day}-${h}`}
                      className="w-7 h-7 rounded cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all"
                      style={{
                        backgroundColor: `rgba(6, 182, 212, ${0.1 + (intensity / 10) * 0.8})`,
                      }}
                      title={`${day} ${h}:00 - ${intensity.toFixed(1)} usage level`}
                    />
                  );
                })}
              </>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-5 text-xs">
          <span className="text-slate-400">Low usage</span>
          <div className="flex gap-1">
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity) => (
              <div
                key={opacity}
                className="w-5 h-5 rounded"
                style={{ backgroundColor: `rgba(6, 182, 212, ${opacity})` }}
              />
            ))}
          </div>
          <span className="text-slate-400">High usage</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Min pH" value={Math.min(...d.series.map((s) => Number(s.pH))).toFixed(2)} />
        <StatBox label="Max pH" value={Math.max(...d.series.map((s) => Number(s.pH))).toFixed(2)} />
        <StatBox
          label="Avg Turbidity"
          value={(d.series.reduce((s, p) => s + Number(p.turbidity), 0) / d.series.length).toFixed(2)}
          unit="NTU"
        />
        <StatBox
          label="Avg Temperature"
          value={(d.series.reduce((s, p) => s + Number(p.temperature), 0) / d.series.length).toFixed(1)}
          unit="°C"
        />
      </div>
    </div>
  );
}

/* ── Helper Components ─────────────────────────────────────────────────── */
function AnalyticsKpi({ label, value, unit, trend, trendUp, icon: Icon, gradient }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-400 text-sm font-medium">{label}</h3>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="flex items-end gap-1 mb-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {unit && <span className="text-xs text-slate-400 mb-0.5">{unit}</span>}
      </div>
      <div className="flex items-center gap-1">
        {trendUp ? (
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
        )}
        <span className={`text-xs ${trendUp ? 'text-emerald-400' : 'text-amber-400'}`}>{trend}</span>
      </div>
    </div>
  );
}

function StatBox({ label, value, unit }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <span className="text-xl font-bold text-white">{value}</span>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </div>
    </div>
  );
}
