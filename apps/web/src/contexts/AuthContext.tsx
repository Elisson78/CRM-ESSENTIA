"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  nome?: string;
  userType?: "admin" | "guia" | "cliente"; // Mapped from user_type if needed
  firstName?: string;
  lastName?: string;
  telefone?: string;
  endereco?: string;
  data_nascimento?: string;
  cpf?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; user?: User }>;
  logout: () => Promise<void>;
  signup: (
    params: {
      email: string;
      password: string;
      nome?: string;
      userType?: "admin" | "guia" | "cliente";
      metadata?: Record<string, string | string[]>;
    }
  ) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from session on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to load user session:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.error || "Erro ao fazer login" };
      }

      setUser((prev) => ({ ...prev, ...data.user }));
      return { user: data.user };
    } catch (error) {
      return { error: "Erro de conexão" };
    }
  };

  const signup: AuthContextType["signup"] = async ({ email, password, nome, userType }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          senha: password, // API expects 'senha'
          nome,
          tipo: userType
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.error || "Erro ao cadastrar" };
      }

      return {};
    } catch (error) {
      return { error: "Erro ao conectar com servidor" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}