import { Clock, Search, Bell, RefreshCw } from 'lucide-react';

export default function Header({ lastUpdated, onRefresh }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Water Management - IIT Kharagpur</h1>
          <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sensors..."
              className="bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
