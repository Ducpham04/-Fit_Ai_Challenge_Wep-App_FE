import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AuthAPI } from "../api/auth.api";
import { tokenService } from "../api/token.service";

interface User {
  id: string;
  email: string;
  fullName: string;
  linkImage?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
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
    
    // Store user ID for easy access
    if (me.data?.id) {
      localStorage.setItem('userId', me.data.id.toString());
    }
    
    return me.data;
  } catch (err) {
    console.error("❌ Login error:", err);
    throw err;
  } finally {
    setIsLoading(false);
  }
};

  const register = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call register API with correct format
      const res = await AuthAPI.register({
        fullName: fullName,
        email: email,
        password: password,
        roleId: null // Will default to 2 (USER) in backend
      });
      
      console.log("Register response:", res.data);
      
      // Get token from response
      const token = res.data.token || res.data.access_token || res.data.accessToken;
      
      if (!token) {
        console.error("❌ Token not found in register response:", res.data);
        throw new Error("No token received from registration");
      }
      
      console.log("✅ Token saved:", token);
      tokenService.updateLocalAccessToken(token);

      // Get user info from response or fetch profile
      let userData;
      if (res.data.user) {
        // User object from response (UserInfoDTO)
        userData = {
          id: res.data.user.id?.toString() || '',
          email: res.data.user.email || email,
          fullName: res.data.user.fullName || fullName,
          role: res.data.user.role || 'USER'
        };
      } else {
        // Fetch user profile after registration
        try {
          const me = await AuthAPI.getProfile();
          userData = me.data;
        } catch (err) {
          console.warn("/auth/user failed, trying /auth/me...", err);
          try {
            const me = await AuthAPI.me();
            userData = me.data;
          } catch (err2) {
            // If both fail, create user data from response or fallback
            console.warn("Could not fetch user profile, using response data as fallback");
            userData = {
              id: res.data.userInfo?.id?.toString() || '',
              email: res.data.userInfo?.email || email,
              fullName: res.data.userInfo?.fullName || fullName,
              role: res.data.userInfo?.role || 'USER'
            };
          }
        }
      }
      
      setUser(userData);
      
      // Store user ID for easy access
      if (userData?.id) {
        localStorage.setItem('userId', userData.id.toString());
      }
      
      return userData;
    } catch (err: any) {
      console.error("❌ Register error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Registration failed. Please try again.";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      let res = await AuthAPI.getProfile();
      setUser(res.data);
    } catch (err) {
      console.warn("/auth/user failed, trying /auth/me...", err);
      try {
        const res = await AuthAPI.me();
        setUser(res.data);
      } catch (err2) {
        console.error("Failed to refresh user:", err2);
      }
    }
  };

  const logout = () => {
    tokenService.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, refreshUser, logout, isLoading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
