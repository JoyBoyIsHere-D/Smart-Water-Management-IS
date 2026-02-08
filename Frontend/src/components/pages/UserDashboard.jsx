import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Droplets, LogOut, User, Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Nav */}
      <header className="border-b border-slate-700/50 bg-slate-800/60 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">Smart Water Management</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome, {user.full_name}</h1>
          <p className="text-slate-400 mt-1">Your water management user dashboard</p>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            Profile Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InfoItem icon={<User className="w-4 h-4" />} label="Unique ID" value={user.unique_id} mono />
            <InfoItem icon={<User className="w-4 h-4" />} label="Full Name" value={user.full_name} />
            <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={user.email || '—'} />
            <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={user.phone || '—'} />
            <InfoItem icon={<MapPin className="w-4 h-4" />} label="Address" value={user.address || '—'} />
            <InfoItem
              icon={<Clock className="w-4 h-4" />}
              label="Last Login"
              value={user.last_sign_in ? new Date(user.last_sign_in).toLocaleString() : 'First login'}
            />
          </div>
        </div>

        {/* Placeholder cards for future features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlaceholderCard title="Usage Summary" description="View your water usage metrics" />
          <PlaceholderCard title="Billing" description="Check outstanding bills" />
          <PlaceholderCard title="Support" description="Raise a support ticket" />
        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-500">{icon}</div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-white ${mono ? 'font-mono text-cyan-400' : ''}`}>{value}</p>
      </div>
    </div>
  );
}

function PlaceholderCard({ title, description }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 hover:border-cyan-500/30 transition-colors">
      <h3 className="text-white font-medium">{title}</h3>
      <p className="text-slate-400 text-sm mt-1">{description}</p>
      <span className="inline-block mt-3 text-xs text-slate-500 bg-slate-700/40 px-2 py-1 rounded">Coming soon</span>
    </div>
  );
}
