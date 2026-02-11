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
    <aside className={`fixed left-0 top-0 h-full bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 z-50 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-between border-b border-slate-700/50">
        <NavLink to="/" className={`flex items-center gap-3 ${!isOpen && 'justify-center w-full'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          {isOpen && <span className="font-bold text-white text-lg">AquaFlow</span>}
        </NavLink>
        {!isOpen && (
          <button onClick={() => setIsOpen(true)} className="text-slate-400 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="p-4 space-y-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              } ${!isOpen && 'justify-center'}`
            }
          >
            <item.icon className="w-5 h-5" />
            {isOpen && <span className="font-medium">{item.label}</span>}
          </NavLink>
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
