import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const flowData = [
  { name: 'Zone A', value: 2400, fill: '#3b82f6' },
  { name: 'Zone B', value: 1800, fill: '#10b981' },
  { name: 'Zone C', value: 1200, fill: '#f59e0b' },
  { name: 'Zone D', value: 900, fill: '#8b5cf6' },
];

export default function FlowDistributionChart() {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Flow Distribution by Zone</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={flowData} layout="vertical" margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} width={50} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {flowData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
