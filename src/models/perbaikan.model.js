import { supabase } from '../config/supabase.js';

const TABLE = 'perbaikan';

// Relasi: tiap perbaikan menyertakan laporan terkait + teknisi yang ditugaskan.
const SELECT_WITH_RELATIONS = `
  id, laporan_id, teknisi_id, status, tanggal_mulai, tanggal_selesai,
  biaya, catatan, created_at, updated_at,
  laporan:laporan!perbaikan_laporan_id_fkey (id, judul, lokasi, status),
  teknisi:users!perbaikan_teknisi_id_fkey (id, nama, email)
`;

export async function findAll(filters = {}) {
  let query = supabase
    .from(TABLE)
    .select(SELECT_WITH_RELATIONS)
    .order('created_at', { ascending: false });
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.laporan_id) query = query.eq('laporan_id', filters.laporan_id);
  if (filters.teknisi_id) query = query.eq('teknisi_id', filters.teknisi_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function findById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_WITH_RELATIONS)
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function create(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select(SELECT_WITH_RELATIONS)
    .single();
  if (error) throw error;
  return data;
}

export async function updateById(id, fields) {
  const allowed = [
    'teknisi_id', 'status', 'tanggal_mulai', 'tanggal_selesai', 'biaya', 'catatan',
  ];
  const payload = Object.fromEntries(
    Object.entries(fields).filter(([k]) => allowed.includes(k))
  );
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select(SELECT_WITH_RELATIONS)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteById(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
