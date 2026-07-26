"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("user") : null;
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    window.localStorage.setItem("token", data.token);
    window.localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    router.push("/dashboard");
  }

  function logout() {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
