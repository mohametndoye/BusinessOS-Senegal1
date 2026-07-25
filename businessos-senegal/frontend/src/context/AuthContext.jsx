import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("bos_token");
      if (!token) {
        setReady(true);
        return;
      }
      try {
        // On revalide toujours le token auprès du serveur (rôle, suspension...)
        const data = await api.getMe();
        localStorage.setItem("bos_user", JSON.stringify(data.user));
        setUser(data.user);
      } catch {
        localStorage.removeItem("bos_token");
        localStorage.removeItem("bos_user");
      }
      setReady(true);
    })();
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem("bos_token", data.token);
    localStorage.setItem("bos_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (businessName, email, password) => {
    const data = await api.register({ businessName, email, password });
    localStorage.setItem("bos_token", data.token);
    localStorage.setItem("bos_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("bos_token");
    localStorage.removeItem("bos_user");
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    const data = await api.getMe();
    localStorage.setItem("bos_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, refreshUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider.");
  return ctx;
}
