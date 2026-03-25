import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Search, Bell, RefreshCw, User, LogOut, Settings, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ lastUpdated, onRefresh, onMenuToggle, sidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.full_name) return 'U';
    return user.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left section: Menu + Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50 flex-shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-white truncate">
              <span className="hidden sm:inline">Smart Water Management - IIT Kharagpur</span>
              <span className="sm:hidden">AquaFlow</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden xs:inline">Last updated:</span> {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Right section: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
          {/* Search - Desktop */}
          <div className="relative hidden lg:block">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sensors..."
              className="bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors w-48 xl:w-64"
            />
          </div>

          {/* Search - Mobile toggle */}
          <div className="relative lg:hidden" ref={searchRef}>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
            >
              <Search className="w-5 h-5" />
            </button>
            {showSearch && (
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-xs">
                <input
                  type="text"
                  placeholder="Search sensors..."
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors shadow-xl"
                />
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Refresh - Hidden on smallest screens */}
          <button
            onClick={onRefresh}
            className="hidden sm:flex items-center gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25 text-sm lg:text-base"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">Refresh</span>
          </button>

          {/* Mobile refresh - icon only */}
          <button
            onClick={onRefresh}
            className="sm:hidden p-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm flex-shrink-0">
                {getInitials()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-white">{user?.full_name || 'Admin User'}</p>
                <p className="text-xs text-slate-400">{user?.email || 'admin@example.com'}</p>
              </div>
              <ChevronDown className={`hidden sm:block w-4 h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-700">
                  <p className="text-sm font-medium text-white">{user?.full_name || 'Admin User'}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@example.com'}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/settings');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/settings');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    System Settings
                  </button>
                </div>

                <div className="py-1 border-t border-slate-700">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
