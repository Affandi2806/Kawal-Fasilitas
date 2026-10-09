import { supabase } from '../config/supabase.js';

const TABLE = 'laporan';

// Relasi: tiap laporan menyertakan data pelapor (users).
const SELECT_WITH_USER = `
  id, judul, deskripsi, lokasi, kategori, foto_url, status,
  user_id, created_at, updated_at,
  pelapor:users!laporan_user_id_fkey (id, nama, email)
`;

export async function findAll(filters = {}) {
  let query = supabase
    .from(TABLE)
    .select(SELECT_WITH_USER)
    .order('created_at', { ascending: false });
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.user_id) query = query.eq('user_id', filters.user_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function findById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_WITH_USER)
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function create(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select(SELECT_WITH_USER)
    .single();
  if (error) throw error;
  return data;
}

export async function updateById(id, fields) {
  const allowed = [
    'judul', 'deskripsi', 'lokasi', 'kategori', 'foto_url', 'status',
  ];
  const payload = Object.fromEntries(
    Object.entries(fields).filter(([k]) => allowed.includes(k))
  );
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select(SELECT_WITH_USER)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteById(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
