import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tgfeedchhogerswntuvy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmVlZGNoaG9nZXJzd250dXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzODAwMjcsImV4cCI6MjA4OTk1NjAyN30.yKXLdHRx64c_TqY9dmZPFjG2tYRlOx_t4QDrlBc9WfQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function testSupabaseConnection() {
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: "GET",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: "application/openapi+json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Supabase svarede ${response.status}${errorText ? `: ${errorText}` : ""}`
    );
  }

  return {
    ok: true,
    status: response.status,
  };
}
