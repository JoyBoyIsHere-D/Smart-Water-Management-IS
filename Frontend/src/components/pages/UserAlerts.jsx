import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, AlertCircle, Clock } from 'lucide-react';
import { getUserDataWithAPI, getEmptyUserData } from '../../data/dummyData';

export default function UserAlerts() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.unique_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserDataWithAPI(user.unique_id, user);
        setUserData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError(err.message);
        setUserData(getEmptyUserData(user.unique_id, user));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.unique_id]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Loading alerts...</div>
      </div>
    );
  }

  if (!userData || userData.noData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-400" />
            Alerts & Notifications
          </h1>
          <p className="text-slate-400 mt-1 text-sm">No alerts available</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-center">
          <Bell className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Alerts</h3>
          <p className="text-slate-400">No alerts or notifications are available for your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-cyan-400" />
          Alerts & Notifications
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Recent alerts for your area</p>
      </div>

      <div className="space-y-4">
        {d.anomalies.map((a, i) => (
          <div
            key={i}
            className={`p-5 rounded-xl border ${
              a.severity === 'high'
                ? 'bg-red-500/10 border-red-500/30'
                : a.severity === 'medium'
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-5 h-5 mt-0.5 ${
                  a.severity === 'high'
                    ? 'text-red-400'
                    : a.severity === 'medium'
                    ? 'text-amber-400'
                    : 'text-blue-400'
                }`}
              />
              <div className="flex-1">
                <h3
                  className={`font-semibold ${
                    a.severity === 'high'
                      ? 'text-red-400'
                      : a.severity === 'medium'
                      ? 'text-amber-400'
                      : 'text-blue-400'
                  }`}
                >
                  {a.message}
                </h3>
                <p className="text-slate-400 text-sm mt-1">{a.details}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{a.time}</span>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  a.severity === 'high'
                    ? 'bg-red-500/20 text-red-400'
                    : a.severity === 'medium'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                {a.severity.toUpperCase()}
              </span>
            </div>
          </div>
        ))}

        {d.anomalies.length === 0 && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No alerts at this time</p>
            <p className="text-slate-500 text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
