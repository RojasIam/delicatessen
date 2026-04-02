import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createClient(url, anonKey);
}
