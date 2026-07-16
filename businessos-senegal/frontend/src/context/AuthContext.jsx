import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("bos_token");
    const storedUser = localStorage.getItem("bos_user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("bos_token");
        localStorage.removeItem("bos_user");
      }
    }
    setReady(true);
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem("bos_token", data.token);
    localStorage.setItem("bos_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (businessName, email, password) => {
    const data = await api.register({ businessName, email, password });
    localStorage.setItem("bos_token", data.token);
    localStorage.setItem("bos_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("bos_token");
    localStorage.removeItem("bos_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider.");
  return ctx;
}
