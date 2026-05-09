// ── Safe session helpers for Supabase auth ──────────────────
import type { SupabaseClient, Session } from "@supabase/supabase-js";

/**
 * Wraps supabase.auth.getSession() to gracefully handle
 * invalid/expired refresh tokens. Instead of throwing,
 * returns { session: null } so the app treats it as "logged out".
 */
export async function safeGetSession(
  supabase: SupabaseClient,
): Promise<{ session: Session | null }> {
  try {
    const { data } = await supabase.auth.getSession();
    return { session: data.session };
  } catch (error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code?: string }).code
        : null;

    if (code === "refresh_token_not_found") {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore signOut errors during cleanup
      }
    }
    return { session: null };
  }
}
