import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { api, clearTokens, loadTokens, setTokens, type UserDTO } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'expert';
  points: number;
  experiencesCount: number;
  requestsCount: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    username: string,
    password: string,
    displayName?: string,
  ) => Promise<boolean>;
  logout: () => void;
  isExpert: boolean;
  loading: boolean;
}

function mapUser(dto: UserDTO): User {
  return {
    id: dto.id,
    name: dto.displayName || dto.username,
    email: dto.email,
    avatar:
      dto.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(dto.displayName || dto.username)}&background=teal&color=fff`,
    role: dto.role,
    points: 0,
    experiencesCount: 0,
    requestsCount: 0,
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTokens();
    const accessToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;
    if (accessToken) {
      api
        .getProfile()
        .then((profile) => setUser(mapUser(profile)))
        .catch(() => clearTokens())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);
      setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      setUser(mapUser(result.user));
      return true;
    } catch (err) {
      throw err;
    }
  }, []);

  const register = useCallback(
    async (
      email: string,
      username: string,
      password: string,
      displayName?: string,
    ) => {
      try {
        const result = await api.register({
          email,
          username,
          password,
          displayName,
        });
        setTokens(result.tokens.accessToken, result.tokens.refreshToken);
        setUser(mapUser(result.user));
        return true;
      } catch (err) {
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isExpert: user?.role === 'expert',
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
