"use client";
import { useCallback, useEffect, useState } from "react";

import { AuthTokenService } from "@/services/auth-token";

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    AuthTokenService.getToken().then((t) => {
      if (!cancelled) {
        setTokenState(t);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setToken = useCallback(async (newToken: string) => {
    await AuthTokenService.setToken(newToken);
    setTokenState(newToken);
  }, []);

  const removeToken = useCallback(() => {
    AuthTokenService.removeToken();
    setTokenState(null);
  }, []);

  return {
    token,
    isLoading,
    isAuthenticated: token !== null,
    setToken,
    removeToken,
    hasToken: AuthTokenService.hasToken,
  };
}
