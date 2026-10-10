import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (authenticated as the signed-in user).
 * Credentials come only from environment variables — never hardcode keys.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
