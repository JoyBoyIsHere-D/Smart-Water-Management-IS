import { NavLink } from 'react-router-dom';
import {
  Droplets, Activity, AlertTriangle, Upload, TrendingUp, Settings, Waves, X, Menu, ChevronLeft, Network, Users
} from 'lucide-react';

const navItems = [
  { icon: Activity, label: 'Overview', path: '/' },
  { icon: Waves, label: 'Water Quality', path: '/quality' },
  { icon: AlertTriangle, label: 'Anomalies', path: '/anomalies' },
  { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
  { icon: Network, label: 'Federated Learning', path: '/federated' },
  // { icon: Upload, label: 'Data Upload', path: '/upload' },
  { icon: Users, label: 'User Management', path: '/users' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 z-50 flex flex-col
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}
      `}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-700/50">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <span className={`font-bold text-white text-lg whitespace-nowrap ${!isOpen && 'lg:hidden'}`}>
            AquaFlow
          </span>
        </NavLink>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              // Close sidebar on mobile after navigation
              if (window.innerWidth < 1024) {
                setIsOpen(false);
              }
            }}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className={`font-medium whitespace-nowrap ${!isOpen && 'lg:hidden'}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Close Sidebar Button - Desktop only */}
      <div className="hidden lg:block p-4 border-t border-slate-700/50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-200"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${!isOpen && 'rotate-180'}`} />
          {isOpen && <span className="font-medium">Close Sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
