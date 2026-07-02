"use client";

import { createAuthClient } from "better-auth/client";
import { useState, useEffect, useCallback } from "react";

const client = createAuthClient();
export const signIn = client.signIn;
export const signOut = client.signOut;
export const { $store } = client;

type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

type SessionResult = {
  data: { user: SessionUser } | null;
  isPending: boolean;
  error: Error | null;
};

/**
 * React hook for session data.
 * Fetches from the better-auth get-session endpoint on mount.
 */
export function useSession(): SessionResult {
  const [state, setState] = useState<SessionResult>({
    data: null,
    isPending: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    try {
      setState((s) => ({ ...s, isPending: true }));
      const res = await fetch("/api/auth/get-session");
      if (res.ok) {
        const session = await res.json();
        setState({
          data: session?.user ? { user: session.user } : null,
          isPending: false,
          error: null,
        });
      } else {
        setState({ data: null, isPending: false, error: null });
      }
    } catch (err) {
      setState({
        data: null,
        isPending: false,
        error: err instanceof Error ? err : new Error("Session fetch failed"),
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return state;
}
