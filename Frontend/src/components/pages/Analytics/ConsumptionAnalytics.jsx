import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Droplets, TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react';

// Mock daily consumption data
const dailyConsumption = [
  { day: 'Mon', consumption: 185000, peak: 12500, offPeak: 5200 },
  { day: 'Tue', consumption: 192000, peak: 13200, offPeak: 4800 },
  { day: 'Wed', consumption: 178000, peak: 11800, offPeak: 5100 },
  { day: 'Thu', consumption: 195000, peak: 13800, offPeak: 5400 },
  { day: 'Fri', consumption: 201000, peak: 14200, offPeak: 5600 },
  { day: 'Sat', consumption: 156000, peak: 9800, offPeak: 6200 },
  { day: 'Sun', consumption: 142000, peak: 8500, offPeak: 6800 },
];

// Mock hourly usage heatmap data
const hourlyUsage = [
  [2, 1, 1, 1, 2, 4, 7, 9, 8, 7, 6, 8, 9, 8, 7, 6, 7, 9, 8, 6, 5, 4, 3, 2], // Mon
  [2, 1, 1, 1, 2, 4, 8, 10, 9, 7, 6, 8, 9, 8, 7, 6, 7, 9, 8, 6, 5, 4, 3, 2], // Tue
  [2, 1, 1, 1, 2, 4, 7, 9, 8, 7, 6, 7, 8, 8, 7, 6, 7, 8, 7, 6, 5, 4, 3, 2], // Wed
  [2, 1, 1, 1, 2, 4, 8, 10, 9, 8, 7, 8, 9, 8, 7, 7, 8, 9, 8, 6, 5, 4, 3, 2], // Thu
  [2, 1, 1, 1, 2, 4, 8, 10, 9, 8, 7, 8, 10, 9, 8, 7, 8, 9, 8, 7, 5, 4, 3, 2], // Fri
  [3, 2, 1, 1, 2, 3, 5, 7, 8, 8, 8, 8, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3], // Sat
  [3, 2, 2, 1, 2, 3, 4, 6, 7, 8, 8, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 3], // Sun
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getHeatColor = (value) => {
  const intensity = value / 10;
  return `rgba(6, 182, 212, ${0.1 + intensity * 0.8})`;
};

const stats = {
  totalWeekly: '1.25M',
  avgDaily: '178K',
  peakHour: '8:00 AM',
  peakDay: 'Friday',
  efficiency: 92.4,
  wastageEstimate: '~95K L',
};

export default function ConsumptionAnalytics() {
  const maxConsumption = Math.max(...dailyConsumption.map(d => d.consumption));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Daily Consumption Chart */}
      <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Daily Consumption</h3>
            <p className="text-sm text-slate-400">Water usage by day of week</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dailyConsumption}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis 
              stroke="#64748b" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#fff'
              }}
              formatter={(value) => [`${(value / 1000).toFixed(1)}K L`, 'Consumption']}
            />
            <Bar dataKey="consumption" radius={[8, 8, 0, 0]}>
              {dailyConsumption.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`rgba(6, 182, 212, ${0.4 + (entry.consumption / maxConsumption) * 0.6})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Consumption Stats</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <span className="text-slate-300">Weekly Total</span>
            </div>
            <span className="text-white font-bold">{stats.totalWeekly} L</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-300">Daily Average</span>
            </div>
            <span className="text-white font-bold">{stats.avgDaily} L</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="text-slate-300">Peak Hour</span>
            </div>
            <span className="text-white font-bold">{stats.peakHour}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-slate-300">Peak Day</span>
            </div>
            <span className="text-white font-bold">{stats.peakDay}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <span className="text-slate-300">Est. Wastage</span>
            </div>
            <span className="text-white font-bold">{stats.wastageEstimate}</span>
          </div>
        </div>
      </div>

      {/* Hourly Usage Heatmap */}
      <div className="lg:col-span-3 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Hourly Usage Heatmap</h3>
            <p className="text-sm text-slate-400">Usage intensity by hour and day</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex mb-2 pl-12">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-xs text-slate-500">
                  {i.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
            
            {/* Heatmap rows */}
            {days.map((day, dayIndex) => (
              <div key={day} className="flex items-center mb-1">
                <div className="w-12 text-sm text-slate-400">{day}</div>
                <div className="flex-1 flex gap-0.5">
                  {hourlyUsage[dayIndex].map((value, hourIndex) => (
                    <div
                      key={hourIndex}
                      className="flex-1 h-8 rounded-sm transition-all hover:scale-110"
                      style={{ backgroundColor: getHeatColor(value) }}
                      title={`${day} ${hourIndex}:00 - Usage: ${value}/10`}
                    />
                  ))}
                </div>
              </div>
            ))}
            
            {/* Legend */}
            <div className="flex items-center justify-end mt-4 gap-2">
              <span className="text-xs text-slate-400">Low</span>
              <div className="flex gap-0.5">
                {[1, 3, 5, 7, 9].map(v => (
                  <div
                    key={v}
                    className="w-6 h-4 rounded-sm"
                    style={{ backgroundColor: getHeatColor(v) }}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400">High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
