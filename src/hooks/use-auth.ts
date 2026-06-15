"use client";
import { useState, useEffect } from "react";
import { type User } from "@supabase/supabase-js";
import { loginWithEmail, logout, onAuthChange } from "@/services/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    const u = await loginWithEmail(email, password);
    setUser(u);
    return u;
  }

  async function signOut() {
    await logout();
    setUser(null);
  }

  return { user, loading, login, logout: signOut, isAuthenticated: !!user };
}
