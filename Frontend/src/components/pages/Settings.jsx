import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Palette, Save, Check } from 'lucide-react';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'thresholds', label: 'Alert Thresholds', icon: Shield },
  { id: 'data', label: 'Data Management', icon: Database },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);
  
  const [thresholds, setThresholds] = useState({
    pH: { min: 6.5, max: 8.5 },
    turbidity: { max: 5 },
    tds: { max: 500 },
    temperature: { min: 15, max: 30 },
    flowRate: { max: 100 },
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    critical: true,
    warning: true,
    info: false,
    dailyReport: true,
    weeklyReport: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-slate-400">Configure your dashboard preferences</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
          <nav className="space-y-2">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="System Administrator"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="admin@aquaflow.com"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Role</label>
                  <select className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500">
                    <option>Administrator</option>
                    <option>Operator</option>
                    <option>Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Timezone</label>
                  <select className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500">
                    <option>UTC+5:30 (IST)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC-5 (EST)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-400">Delivery Methods</h4>
                {[
                  { key: 'email', label: 'Email Notifications' },
                  { key: 'push', label: 'Push Notifications' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                    <span className="text-white">{label}</span>
                    <button
                      onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications[key] ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications[key] ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-400">Alert Levels</h4>
                {[
                  { key: 'critical', label: 'Critical Alerts', color: 'text-red-400' },
                  { key: 'warning', label: 'Warning Alerts', color: 'text-amber-400' },
                  { key: 'info', label: 'Info Alerts', color: 'text-blue-400' },
                ].map(({ key, label, color }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                    <span className={color}>{label}</span>
                    <button
                      onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications[key] ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications[key] ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Threshold Settings */}
          {activeSection === 'thresholds' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Alert Thresholds</h3>
              <p className="text-slate-400 text-sm">Configure when alerts are triggered for each metric</p>
              
              <div className="space-y-4">
                {Object.entries(thresholds).map(([metric, values]) => (
                  <div key={metric} className="p-4 bg-slate-700/30 rounded-xl">
                    <h4 className="text-white font-medium mb-4 capitalize">{metric.replace(/([A-Z])/g, ' $1')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {values.min !== undefined && (
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Minimum</label>
                          <input
                            type="number"
                            value={values.min}
                            onChange={(e) => setThresholds({
                              ...thresholds,
                              [metric]: { ...values, min: parseFloat(e.target.value) }
                            })}
                            className="w-full bg-slate-600/50 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      )}
                      {values.max !== undefined && (
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Maximum</label>
                          <input
                            type="number"
                            value={values.max}
                            onChange={(e) => setThresholds({
                              ...thresholds,
                              [metric]: { ...values, max: parseFloat(e.target.value) }
                            })}
                            className="w-full bg-slate-600/50 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Management */}
          {activeSection === 'data' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Data Management</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <h4 className="text-white font-medium mb-2">Data Retention</h4>
                  <p className="text-slate-400 text-sm mb-4">How long to keep historical sensor data</p>
                  <select className="w-full bg-slate-600/50 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500">
                    <option>30 days</option>
                    <option>90 days</option>
                    <option>1 year</option>
                    <option>Forever</option>
                  </select>
                </div>
                
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <h4 className="text-white font-medium mb-2">Export Data</h4>
                  <p className="text-slate-400 text-sm mb-4">Download all sensor data as CSV</p>
                  <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors">
                    Export All Data
                  </button>
                </div>
                
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <h4 className="text-red-400 font-medium mb-2">Danger Zone</h4>
                  <p className="text-slate-400 text-sm mb-4">Permanently delete all sensor data</p>
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                    Delete All Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Appearance</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <h4 className="text-white font-medium mb-4">Theme</h4>
                  <div className="flex gap-4">
                    <button className="flex-1 p-4 rounded-xl bg-slate-900 border-2 border-cyan-500 text-white">
                      Dark
                    </button>
                    <button className="flex-1 p-4 rounded-xl bg-slate-600 border-2 border-slate-500 text-slate-400">
                      Light (Coming Soon)
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <h4 className="text-white font-medium mb-4">Accent Color</h4>
                  <div className="flex gap-3">
                    {['cyan', 'blue', 'purple', 'emerald', 'amber'].map((color) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-full bg-${color}-500 ${
                          color === 'cyan' ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
