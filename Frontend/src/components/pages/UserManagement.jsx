import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users, UserPlus, Trash2, Edit3, Search, AlertCircle, Loader2,
  CheckCircle, XCircle, ChevronDown, ChevronUp, X, Filter, 
  UserCheck, UserX, Shield, Mail, Phone, MapPin, Calendar,
  TrendingUp, Activity
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'id', 'recent'
  const [actionLoading, setActionLoading] = useState(null);

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
    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        setSuccess('User deleted successfully');
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.detail || 'Delete failed');
      }
    } catch {
      setError('Connection failed');
    }
    setActionLoading(null);
  };

  // ─── Toggle active ────────────────────────────────
  const toggleActive = async (u) => {
    setActionLoading(u.id);
    try {
      const res = await fetch(`${API_URL}/api/users/${u.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ is_active: !u.is_active }),
      });
      if (res.ok) {
        setSuccess(`User ${u.is_active ? 'deactivated' : 'activated'} successfully`);
        fetchUsers();
      }
    } catch {
      setError('Connection failed');
    }
    setActionLoading(null);
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
      (u.unique_id.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()))) &&
      (filterStatus === 'all' || 
       (filterStatus === 'active' && u.is_active) ||
       (filterStatus === 'inactive' && !u.is_active))
  ).sort((a, b) => {
    if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
    if (sortBy === 'id') return a.unique_id.localeCompare(b.unique_id);
    if (sortBy === 'recent' && a.last_sign_in && b.last_sign_in) {
      return new Date(b.last_sign_in) - new Date(a.last_sign_in);
    }
    return 0;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    recentLogins: users.filter(u => u.last_sign_in && 
      (new Date() - new Date(u.last_sign_in)) < 7 * 24 * 60 * 60 * 1000).length
  };

  // ─── Render ────────────────────────────────────────
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Users className="w-7 h-7 text-white" />
            </div>
            User Management
          </h1>
          <p className="text-slate-400 mt-2 ml-1">Register and manage portal users</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
        >
          {showForm ? <ChevronUp className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          {showForm ? 'Hide Form' : 'Add New User'}
        </button>
      </div>

      {/* Statistics Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-all">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-slate-400">Total Users</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-5 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-all">
                <UserCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs text-emerald-400 font-medium px-2 py-1 bg-emerald-500/10 rounded-full">
                {stats.total ? Math.round((stats.active / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-sm text-slate-400">Active Users</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-5 hover:border-red-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-all">
                <UserX className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-xs text-red-400 font-medium px-2 py-1 bg-red-500/10 rounded-full">
                {stats.total ? Math.round((stats.inactive / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{stats.inactive}</p>
              <p className="text-sm text-slate-400">Inactive Users</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-all">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{stats.recentLogins}</p>
              <p className="text-sm text-slate-400">Active This Week</p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 backdrop-blur-sm animate-in slide-in-from-top duration-300">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          </div>
          <span className="text-sm flex-1">{error}</span>
          <button 
            onClick={() => setError('')} 
            className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400 backdrop-blur-sm animate-in slide-in-from-top duration-300">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          </div>
          <span className="text-sm flex-1">{success}</span>
          <button 
            onClick={() => setSuccess('')} 
            className="p-1 hover:bg-emerald-500/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl">
                {editingUser ? <Edit3 className="w-5 h-5 text-cyan-400" /> : <UserPlus className="w-5 h-5 text-cyan-400" />}
              </div>
              <h3 className="text-xl font-semibold text-white">
                {editingUser ? 'Edit User' : 'Register New User'}
              </h3>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Unique ID *
                </label>
                <input
                  value={form.unique_id}
                  onChange={(e) => setForm({ ...form, unique_id: e.target.value })}
                  disabled={!!editingUser}
                  placeholder="WU-2024-001"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Full Name *
                </label>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Phone className="w-4 h-4 text-cyan-400" />
                  Phone
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91-9876543210"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Address
              </label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Water Lane, City, State"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name or email…"
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition-all"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                filterStatus === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Active
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                filterStatus === 'inactive'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <UserX className="w-4 h-4" />
              Inactive
            </button>
          </div>
          
          {/* Sort */}
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="id">Sort by ID</option>
              <option value="recent">Recent Login</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        
        {/* Results count */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Showing <span className="text-white font-medium">{filtered.length}</span> of <span className="text-white font-medium">{users.length}</span> users
          </span>
          {(search || filterStatus !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilterStatus('all'); }}
              className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-12">
          <div className="flex flex-col items-center justify-center text-slate-400 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <p>Loading users…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-12">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-slate-700/50 rounded-full">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">
                {users.length === 0 ? 'No Users Yet' : 'No Results Found'}
              </p>
              <p className="text-slate-400 max-w-md mx-auto">
                {users.length === 0 
                  ? 'Get started by clicking the "Add New User" button to register your first portal user.' 
                  : 'Try adjusting your search or filter criteria to find what you\'re looking for.'}
              </p>
            </div>
            {users.length === 0 && (
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                <UserPlus className="w-5 h-5" />
                Add Your First User
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700/30 border-b border-slate-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Name & Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map((u) => (
                  <tr 
                    key={u.id} 
                    className="hover:bg-slate-700/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                          <Shield className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="font-mono font-medium text-cyan-400">{u.unique_id}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-white">{u.full_name}</p>
                        <div className="flex flex-col gap-0.5 text-xs text-slate-400">
                          {u.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {u.email}
                            </span>
                          )}
                          {u.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {u.phone}
                            </span>
                          )}
                          {u.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {u.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={actionLoading === u.id}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                          u.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {actionLoading === u.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : u.is_active ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {u.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Calendar className="w-4 h-4" />
                        {u.last_sign_in ? (
                          <span>{new Date(u.last_sign_in).toLocaleString()}</span>
                        ) : (
                          <span className="italic">Never signed in</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => startEdit(u)} 
                          className="p-2 hover:bg-cyan-500/10 rounded-lg text-slate-400 hover:text-cyan-400 transition-all group/btn"
                          title="Edit user"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)} 
                          disabled={actionLoading === u.id}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete user"
                        >
                          {actionLoading === u.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
