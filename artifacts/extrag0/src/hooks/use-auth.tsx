import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, useLogin, useLogout, useRegister } from "@workspace/api-client-react";
import type { User, LoginInput, RegisterInput } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: ReturnType<typeof useLogin>["mutateAsync"];
  register: ReturnType<typeof useRegister>["mutateAsync"];
  logout: () => void;
  token: string | null;
  setToken: (token: string | null) => void;
  refreshUser: () => Promise<void>;
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

  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useGetMe({
    query: {
      queryKey: ["me", token],
      enabled: !!token,
      retry: false,
      // We already have the freshly-authenticated user seeded into this
      // exact cache entry right after login/register (see below), so a
      // background revalidation on mount/focus should never flash a
      // false "unauthenticated" state while it's in flight.
      refetchOnMount: false,
    }
  });

  // Clear stale token when the server genuinely rejects it (e.g. after a
  // restart or manual token tampering). Guarded by `!user` so a transient
  // network hiccup right after login — where we've already seeded the
  // cache with a valid user from the login response — can never clear a
  // perfectly good session and cause a false auth error / redirect flash.
  useEffect(() => {
    if (!isLoading && error && token && !user) {
      const httpStatus = (error as any)?.response?.status;
      if (httpStatus === 401 || httpStatus === 403) {
        setToken(null);
      }
    }
  }, [error, isLoading, token, user]);

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
          // Seed the exact cache entry the next render will read from
          // BEFORE flipping the token, so the query never has to hit the
          // network (and never has a window to briefly error out) before
          // the rest of the app sees a fully-authenticated user.
          queryClient.setQueryData(["me", res.token], res.user);
          setToken(res.token);
          return res;
        },
        register: async (data, opts) => {
          const res = await registerMutation.mutateAsync(data, opts);
          queryClient.setQueryData(["me", res.token], res.user);
          setToken(res.token);
          return res;
        },
        logout: handleLogout,
        token,
        setToken,
        // The `me` query has `refetchOnMount: false` (see above) so a
        // successful action that changes the server-side user record
        // (email/phone verification, KYC status advance, etc.) would
        // otherwise leave `user` stale until an unrelated remount or window
        // focus happens to trigger a refetch. Any flow that changes the
        // logged-in user's own state on the server must call this
        // immediately after success so the UI advances without a manual
        // page refresh.
        refreshUser: async () => {
          await queryClient.invalidateQueries({ queryKey: ["me", token] });
        },
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
