import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const qualityClassification = [
  { label: 'Excellent', value: 45, color: '#10b981' },
  { label: 'Good', value: 30, color: '#3b82f6' },
  { label: 'Fair', value: 15, color: '#f59e0b' },
  { label: 'Poor', value: 10, color: '#ef4444' },
];

export default function QualityPieChart() {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Quality Classification</h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={qualityClassification}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            dataKey="value"
            paddingAngle={3}
          >
            {qualityClassification.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {qualityClassification.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-xs sm:text-sm text-slate-300">{item.label}: {item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
