import { supabase } from '../config/supabase.js';

const TABLE = 'users';
const PUBLIC_FIELDS = 'id, nama, email, role, created_at, updated_at';

export async function findAll() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(PUBLIC_FIELDS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function findById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(PUBLIC_FIELDS)
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function findByEmail(email) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('email', email)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function create({ nama, email, password_hash, role = 'pelapor' }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ nama, email, password_hash, role })
    .select(PUBLIC_FIELDS)
    .single();
  if (error) throw error;
  return data;
}

export async function updateById(id, fields) {
  const allowed = ['nama', 'email', 'password_hash', 'role'];
  const payload = Object.fromEntries(
    Object.entries(fields).filter(([k]) => allowed.includes(k))
  );
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select(PUBLIC_FIELDS)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteById(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
