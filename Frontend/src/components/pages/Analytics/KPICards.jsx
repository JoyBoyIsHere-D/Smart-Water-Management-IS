import { 
  Activity, 
  AlertTriangle, 
  Droplets, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

const kpiData = [
  {
    title: 'Avg. Health Index',
    value: '82.4',
    unit: '/100',
    change: '+5.2%',
    changeType: 'positive',
    icon: Activity,
    gradient: 'from-emerald-500 to-emerald-600',
    description: 'vs previous period'
  },
  {
    title: 'Total Anomalies',
    value: '24',
    unit: '',
    change: '-12%',
    changeType: 'positive',
    icon: AlertTriangle,
    gradient: 'from-amber-500 to-orange-500',
    description: 'detected this period'
  },
  {
    title: 'Avg. pH Level',
    value: '7.2',
    unit: '',
    change: '+0.1',
    changeType: 'neutral',
    icon: Droplets,
    gradient: 'from-purple-500 to-purple-600',
    description: 'within safe range'
  },
  {
    title: 'Water Consumed',
    value: '1.2M',
    unit: 'L',
    change: '+8.5%',
    changeType: 'neutral',
    icon: Zap,
    gradient: 'from-cyan-500 to-blue-500',
    description: 'total consumption'
  },
  {
    title: 'Sensor Uptime',
    value: '99.8',
    unit: '%',
    change: '+0.2%',
    changeType: 'positive',
    icon: Clock,
    gradient: 'from-blue-500 to-indigo-500',
    description: 'availability rate'
  },
  {
    title: 'Compliance Rate',
    value: '96.5',
    unit: '%',
    change: '+2.1%',
    changeType: 'positive',
    icon: CheckCircle,
    gradient: 'from-teal-500 to-emerald-500',
    description: 'within safe limits'
  },
];

export default function KPICards({ data }) {
  // In a real app, you'd use the data prop to calculate these values
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiData.map((kpi, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm font-medium">{kpi.title}</span>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.gradient}`}>
              <kpi.icon className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex items-end gap-1 mb-2">
            <span className="text-3xl font-bold text-white">{kpi.value}</span>
            {kpi.unit && <span className="text-slate-400 text-sm mb-1">{kpi.unit}</span>}
          </div>
          
          <div className="flex items-center gap-2">
            {kpi.changeType === 'positive' ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : kpi.changeType === 'negative' ? (
              <TrendingDown className="w-4 h-4 text-red-400" />
            ) : (
              <TrendingUp className="w-4 h-4 text-slate-400" />
            )}
            <span className={`text-xs font-medium ${
              kpi.changeType === 'positive' ? 'text-emerald-400' : 
              kpi.changeType === 'negative' ? 'text-red-400' : 'text-slate-400'
            }`}>
              {kpi.change}
            </span>
            <span className="text-xs text-slate-500">{kpi.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
