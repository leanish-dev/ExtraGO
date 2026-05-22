import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, useLogin, useLogout, useRegister } from "@workspace/api-client-react";
import type { User, LoginInput, RegisterInput } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: ReturnType<typeof useLogin>["mutateAsync"];
  register: ReturnType<typeof useRegister>["mutateAsync"];
  logout: () => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("extragO_token");
  });
  
  const [, setLocation] = useLocation();

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("extragO_token"));
  }, []);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("extragO_token", newToken);
    } else {
      localStorage.removeItem("extragO_token");
    }
    setTokenState(newToken);
  };

  const { data: user, isLoading, refetch } = useGetMe({
    query: {
      queryKey: ["me", token],
      enabled: !!token,
      retry: false,
    }
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      // ignore
    } finally {
      setToken(null);
      setLocation("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        login: async (data, opts) => {
          const res = await loginMutation.mutateAsync(data, opts);
          setToken(res.token);
          await refetch();
          return res;
        },
        register: async (data, opts) => {
          const res = await registerMutation.mutateAsync(data, opts);
          setToken(res.token);
          await refetch();
          return res;
        },
        logout: handleLogout,
        token,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
