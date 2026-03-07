// ── Browser / Client-side Supabase client ──────────────────
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  
  if (!url || !key) {
    console.error('Supabase credentials missing!', { url, keyLength: key?.length });
  } else {
    console.log('Client Init:', { 
      url: url.slice(0, 15) + '...', 
      keySuffix: '...' + key.slice(-3),
      keyLength: key.length 
    });
  }

  return createBrowserClient(url, key)
}
