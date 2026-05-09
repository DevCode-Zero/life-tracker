"use client";

import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { safeGetSession } from "@/lib/supabase/safe-session";
import { useStore } from "@/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useStore();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Get initial session
    safeGetSession(supabase)
      .then(({ session }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            full_name: session.user.user_metadata?.full_name ?? "",
            avatar_url: session.user.user_metadata?.avatar_url ?? null,
            currency: "INR",
            timezone: "Asia/Kolkata",
            created_at: session.user.created_at ?? "",
            updated_at: session.user.updated_at ?? "",
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          full_name: session.user.user_metadata?.full_name ?? "",
          avatar_url: session.user.user_metadata?.avatar_url ?? null,
          currency: "INR",
          timezone: "Asia/Kolkata",
          created_at: session.user.created_at ?? "",
          updated_at: session.user.updated_at ?? "",
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
