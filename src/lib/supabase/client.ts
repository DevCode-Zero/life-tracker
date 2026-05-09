// ── Browser / Client-side Supabase client ──────────────────
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

  if (!url || !key) {
    if (process.env.NODE_ENV === "development") {
      console.error("Supabase credentials missing!");
    }
  }

  return createBrowserClient(url, key);
}
