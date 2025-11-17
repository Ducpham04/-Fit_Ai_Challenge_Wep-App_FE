import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AuthAPI } from "../api/auth.api";
import { tokenService } from "../api/token.service";

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<any>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = tokenService.getLocalAccessToken();
      if (token) {
        try {
          const res = await AuthAPI.me();
          setUser(res.data);
          console.log("User authenticated:", res.data);
        } catch {
          tokenService.clearTokens();
        }
      }
      setIsLoading(false);
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await AuthAPI.login({ email, password });
      tokenService.updateLocalAccessToken(res.data.token);
      setUser(res.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    tokenService.clearTokens();
    setUser(null);
  };

  const register = async (username: string, email: string, password: string) => {
    return await AuthAPI.register({ username, email, password });
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        register,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
