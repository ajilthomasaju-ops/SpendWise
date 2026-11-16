import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  authApi,
  getStoredToken,
  setStoredToken,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      const existingToken = getStoredToken();
      if (!existingToken) {
        if (active) setInitializing(false);
        return;
      }
      try {
        const res = await authApi.me();
        if (active) {
          setUser(res.user);
          setToken(existingToken);
        }
      } catch {
        setStoredToken(null);
        if (active) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (active) setInitializing(false);
      }
    };
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Stateless JWT logout proceeds cleanly even if network fails
    } finally {
      setStoredToken(null);
      setToken(null);
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const res = await authApi.updateProfile(payload);
    setUser(res.user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        initializing,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
