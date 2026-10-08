import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    'SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di file .env'
  );
}

// Server memakai service_role key sehingga RLS di-bypass secara sah.
// Jangan expose key ini ke client/frontend.
export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
