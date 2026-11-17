
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nettrack_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem('nettrack_token')
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('nettrack_token');

      if (storedToken) {
        try {
          const res = await api.get('/auth/me');

          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem(
              'nettrack_user',
              JSON.stringify(res.data.user)
            );
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          logout();
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password, portal = null) => {
    try {
      const res = await api.post('/auth/login', { email, password });

      if (!res.data.success) {
        return {
          success: false,
          message: res.data.message || 'Login failed'
        };
      }

      const loggedInUser = res.data.user;
      const role = loggedInUser?.role;

      // Admin portal accepts only Admin accounts.
      if (portal === 'admin' && role !== 'Admin') {
        return {
          success: false,
          message: 'Access denied. Please use the User Login page.'
        };
      }

      // User portal accepts Faculty / IT Staff and Viewer accounts.
      if (
        portal === 'user' &&
        !['Faculty / IT Staff', 'Viewer'].includes(role)
      ) {
        return {
          success: false,
          message: 'Access denied. Please use the Admin Login page.'
        };
      }

      setToken(res.data.token);
      setUser(loggedInUser);

      localStorage.setItem('nettrack_token', res.data.token);
      localStorage.setItem(
        'nettrack_user',
        JSON.stringify(loggedInUser)
      );

      return { success: true, user: loggedInUser };

    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          'Login failed. Please verify your credentials.'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem('nettrack_token');
    localStorage.removeItem('nettrack_user');
  };

  const isAdmin = user?.role === 'Admin';

  const isFacultyStaff = user?.role === 'Faculty / IT Staff';

  const isStaff = isAdmin || isFacultyStaff;

  const isViewer = user?.role === 'Viewer';

  const isRegularUser = isFacultyStaff || isViewer;

  const roleName = user?.role || 'Viewer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isStaff,
        isFacultyStaff,
        isViewer,
        isRegularUser,
        roleName
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
