import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, IdCard } from 'lucide-react';
import { getUserDataWithAPI, getEmptyUserData } from '../../data/dummyData';

export default function UserProfile() {
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
        <div className="text-slate-400">Loading profile...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">No profile data available</div>
      </div>
    );
  }

  // Show empty state for users with no data
  if (userData.noData && !userData.user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-cyan-400" />
            My Profile
          </h1>
          <p className="text-slate-400 mt-1 text-sm">View and manage your account information</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-center">
          <User className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Profile Data</h3>
          <p className="text-slate-400">Your profile information is not available at this time.</p>
        </div>
      </div>
    );
  }

  const profileUser = userData.user;

  const fields = [
    { icon: IdCard, label: 'Unique ID', value: profileUser.unique_id },
    { icon: User, label: 'Full Name', value: profileUser.full_name },
    { icon: MapPin, label: 'Address', value: profileUser.area },
    { icon: Mail, label: 'Email', value: profileUser.email || 'Not provided' },
    { icon: Phone, label: 'Phone', value: profileUser.phone || 'Not provided' },
    { icon: Calendar, label: 'Member Since', value: 'January 2024' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-cyan-400" />
          My Profile
        </h1>
        <p className="text-slate-400 mt-1 text-sm">View and manage your account information</p>
      </div>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-8">
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-700/50">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profileUser.full_name}</h2>
            <p className="text-slate-400 text-sm mt-1">{profileUser.unique_id}</p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-slate-700/30">
                <field.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{field.label}</p>
                <p className="text-white font-medium">{field.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button (disabled for now) */}
        <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-end">
          <button
            disabled
            className="px-6 py-2.5 rounded-lg bg-slate-700/30 text-slate-500 cursor-not-allowed text-sm font-medium"
          >
            Edit Profile (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
