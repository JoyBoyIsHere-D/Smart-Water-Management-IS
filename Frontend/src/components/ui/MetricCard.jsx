export default function MetricCard({ title, value, unit, icon: Icon, iconGradient, trend }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 font-medium">{title}</h3>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${iconGradient}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-white">{value}</span>
        {unit && <span className="text-slate-400 mb-1">{unit}</span>}
      </div>
      {trend && (
        <div className="flex items-center gap-2 mt-2">
          <trend.icon className={`w-4 h-4 ${trend.color}`} />
          <span className={`text-sm ${trend.color}`}>{trend.text}</span>
        </div>
      )}
    </div>
  );
}
