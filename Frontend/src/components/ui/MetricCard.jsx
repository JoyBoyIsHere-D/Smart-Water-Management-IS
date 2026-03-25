export default function MetricCard({ title, value, unit, icon: Icon, iconGradient, trend }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-slate-400 text-xs sm:text-sm font-medium truncate pr-2">{title}</h3>
        <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${iconGradient} flex-shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      </div>
      <div className="flex items-end gap-1 sm:gap-2">
        <span className="text-2xl sm:text-4xl font-bold text-white">{value}</span>
        {unit && <span className="text-slate-400 mb-0.5 sm:mb-1 text-xs sm:text-base">{unit}</span>}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
          <trend.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${trend.color}`} />
          <span className={`text-xs sm:text-sm ${trend.color}`}>{trend.text}</span>
        </div>
      )}
    </div>
  );
}
