import {
  Droplets, Activity, AlertTriangle, Upload, TrendingUp, Settings, Waves, X, Menu, ChevronLeft
} from 'lucide-react';

const navItems = [
  { icon: Activity, label: 'Overview', id: 'overview' },
  { icon: Waves, label: 'Water Quality', id: 'quality' },
  { icon: AlertTriangle, label: 'Anomalies', id: 'anomalies' },
  { icon: TrendingUp, label: 'Analytics', id: 'analytics' },
  { icon: Upload, label: 'Data Upload', id: 'upload' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export default function Sidebar({ isOpen, setIsOpen, activeTab, setActiveTab }) {
  return (
    <aside className={`fixed left-0 top-0 h-full bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 z-50 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-between border-b border-slate-700/50">
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center w-full'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          {isOpen && <span className="font-bold text-white text-lg">AquaFlow</span>}
        </div>
        {!isOpen && (
          <button onClick={() => setIsOpen(true)} className="text-slate-400 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="p-4 space-y-2 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
            } ${!isOpen && 'justify-center'}`}
          >
            <item.icon className="w-5 h-5" />
            {isOpen && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Close Sidebar Button */}
      {isOpen && (
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Close Sidebar</span>
          </button>
        </div>
      )}
    </aside>
  );
}
