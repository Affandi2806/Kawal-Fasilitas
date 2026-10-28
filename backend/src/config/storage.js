import { supabase } from './supabase.js';

// Nama bucket foto laporan di Supabase Storage.
// Bucket dibuat di Dashboard (Storage) dan diset Public.
// Server mengunggah dengan service_role key (bypass RLS Storage),
// jadi tidak perlu policy upload — tapi bucketnya harus sudah ada.
export const STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || 'foto-laporan';

// Unggah buffer foto ke bucket, kembalikan URL publiknya.
// Path: laporan/<user_id>/<timestamp>-<random>.<ext>
export async function uploadFotoLaporan(buffer, { userId, mimetype }) {
  const ext =
    mimetype === 'image/png'
      ? 'png'
      : mimetype === 'image/webp'
        ? 'webp'
        : 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `laporan/${userId}/${filename}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, { contentType: mimetype, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}
