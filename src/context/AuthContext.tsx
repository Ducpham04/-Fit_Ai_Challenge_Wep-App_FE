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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user từ token khi mount
  useEffect(() => {
    const init = async () => {
      const token = tokenService.getLocalAccessToken();
      if (token) {
        try {
          // Thử /auth/user trước (nếu /auth/me fail)
          let res = await AuthAPI.getProfile();
          console.log("User profile from /auth/user:", res.data);
          setUser(res.data);
        } catch (err) {
          console.warn("/auth/user failed, trying /auth/me...", err);
          try {
            const res = await AuthAPI.me();
            console.log("User profile from /auth/me:", res.data);
            setUser(res.data);
          } catch (err2) {
            console.error("Both /auth/user and /auth/me failed:", err2);
            tokenService.clearTokens();
            setUser(null);
          }
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
    console.log("Login response:", res.data);
    
    // Thử các tên token khác nhau
    const token = res.data.token || res.data.access_token || res.data.accessToken;
    
    if (!token) {
      console.error("❌ Token not found in response:", res.data);
      throw new Error("No token received from login");
    }
    
    console.log("✅ Token saved:", token);
    tokenService.updateLocalAccessToken(token);

    // fetch user profile
    console.log("Fetching user profile...");
    let me;
    try {
      // Thử /auth/user trước
      me = await AuthAPI.getProfile();
      console.log("✅ User profile from /auth/user:", me.data);
    } catch (err) {
      console.warn("/auth/user failed, trying /auth/me...", err);
      me = await AuthAPI.me();
      console.log("✅ User profile from /auth/me:", me.data);
    }
    
    setUser(me.data);
    return me.data;
  } catch (err) {
    console.error("❌ Login error:", err);
    throw err;
  } finally {
    setIsLoading(false);
  }
};


  const logout = () => {
    tokenService.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
