import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  client = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
  return client;
}

/**
 * Server-only client, uses the service role key so route handlers and
 * server components can write to the cache tables. Never import this from
 * a client component — the service role key must not reach the browser.
 * Lazily initialized so the app can build without Supabase env vars set.
 */
export const supabaseServer: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

/** Lets callers degrade gracefully (skip caching) instead of throwing when
 * Supabase hasn't been configured yet — e.g. a fresh checkout of this repo. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
