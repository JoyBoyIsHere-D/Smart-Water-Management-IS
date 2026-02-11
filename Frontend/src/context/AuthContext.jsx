import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'user'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    const storedRole = localStorage.getItem('user_role');
    if (!token) {
      setLoading(false);
      return;
    }

    // For portal users we don't have a /api/auth/me – restore from localStorage
    if (storedRole === 'user') {
      const stored = localStorage.getItem('portal_user');
      if (stored) {
        setUser(JSON.parse(stored));
        setUserRole('user');
      }
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setUserRole('admin');
      } else {
        // Token invalid, try refresh
        await refreshToken();
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('portal_user');
    }
    setLoading(false);
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return false;

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        setUser(data.user);
        return true;
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    return false;
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_role', 'admin');
        setUser(data.user);
        setUserRole('admin');
        return { success: true };
      } else {
        setError(data.detail || 'Login failed');
        return { success: false, error: data.detail };
      }
    } catch (err) {
      const errorMsg = 'Connection failed. Make sure the server is running.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (email, password, fullName) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          full_name: fullName 
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        setUser(data.user);
        return { success: true };
      } else {
        setError(data.detail || 'Registration failed');
        return { success: false, error: data.detail };
      }
    } catch (err) {
      const errorMsg = 'Connection failed. Make sure the server is running.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Portal-user login (unique ID only, no password)
  const userLogin = async (uniqueId) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unique_id: uniqueId })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_role', 'user');
        localStorage.setItem('portal_user', JSON.stringify(data.user));
        setUser(data.user);
        setUserRole('user');
        return { success: true };
      } else {
        setError(data.detail || 'Login failed');
        return { success: false, error: data.detail };
      }
    } catch (err) {
      const errorMsg = 'Connection failed. Make sure the server is running.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('access_token');
    
    try {
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('Logout request failed:', err);
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('portal_user');
    setUser(null);
    setUserRole(null);
  };

  const updateProfile = async (profileData) => {
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.detail };
      }
    } catch (err) {
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const value = {
    user,
    userRole,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    userLogin,
    register,
    logout,
    updateProfile,
    refreshToken,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
