import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users, UserPlus, Trash2, Edit3, Search, AlertCircle, Loader2,
  CheckCircle, XCircle, ChevronDown, ChevronUp, X
} from 'lucide-react';

const API_URL = 'http://localhost:5000';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form state
  const [form, setForm] = useState({
    unique_id: '',
    full_name: '',
    email: '',
    phone: '',
    address: '',
  });

  const token = () => localStorage.getItem('access_token');

  // ─── Fetch users ───────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        setError(data.detail || 'Failed to load users');
      }
    } catch {
      setError('Connection failed');
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // ─── Create / Update ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.unique_id.trim() || !form.full_name.trim()) {
      setError('Unique ID and Full Name are required');
      return;
    }

    try {
      const isEdit = !!editingUser;
      const url = isEdit
        ? `${API_URL}/api/users/${editingUser.id}`
        : `${API_URL}/api/users/register`;
      const method = isEdit ? 'PUT' : 'POST';

      const body = isEdit
        ? { full_name: form.full_name, email: form.email || null, phone: form.phone || null, address: form.address || null }
        : { ...form, email: form.email || null, phone: form.phone || null, address: form.address || null };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(isEdit ? 'User updated successfully' : `User created — ID: ${form.unique_id}`);
        resetForm();
        fetchUsers();
      } else {
        setError(data.detail || 'Operation failed');
      }
    } catch {
      setError('Connection failed');
    }
  };

  // ─── Delete ────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        setSuccess('User deleted');
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.detail || 'Delete failed');
      }
    } catch {
      setError('Connection failed');
    }
  };

  // ─── Toggle active ────────────────────────────────
  const toggleActive = async (u) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${u.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ is_active: !u.is_active }),
      });
      if (res.ok) fetchUsers();
    } catch {
      setError('Connection failed');
    }
  };

  // ─── Helpers ───────────────────────────────────────
  const resetForm = () => {
    setForm({ unique_id: '', full_name: '', email: '', phone: '', address: '' });
    setEditingUser(null);
    setShowForm(false);
  };

  const startEdit = (u) => {
    setForm({
      unique_id: u.unique_id,
      full_name: u.full_name,
      email: u.email || '',
      phone: u.phone || '',
      address: u.address || '',
    });
    setEditingUser(u);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const filtered = users.filter(
    (u) =>
      u.unique_id.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  // ─── Render ────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            User Management
          </h1>
          <p className="text-slate-400 mt-1">Register and manage portal users</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          {showForm ? <ChevronUp className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {showForm ? 'Hide Form' : 'Add User'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingUser ? 'Edit User' : 'Register New User'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Unique ID *</label>
              <input
                value={form.unique_id}
                onChange={(e) => setForm({ ...form, unique_id: e.target.value })}
                disabled={!!editingUser}
                placeholder="WU-2024-001"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Full Name *</label>
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@example.com"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91-9876543210"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-300 mb-1">Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Water Lane"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, name or email…"
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading users…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          {users.length === 0 ? 'No portal users yet. Click "Add User" to register one.' : 'No users match your search.'}
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-700/30">
                <tr>
                  <th className="px-4 py-3">Unique ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-cyan-400">{u.unique_id}</td>
                    <td className="px-4 py-3 text-white">{u.full_name}</td>
                    <td className="px-4 py-3 text-slate-300">{u.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(u)}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          u.is_active
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {u.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {u.last_sign_in ? new Date(u.last_sign_in).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => startEdit(u)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-700/50 text-xs text-slate-400">
            {filtered.length} user{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
