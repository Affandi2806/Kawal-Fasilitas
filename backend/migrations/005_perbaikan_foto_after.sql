-- =====================================================================
-- Migrasi 005: Tambah foto after di tabel perbaikan
-- Jalankan di Supabase Dashboard > SQL Editor SETELAH migrasi 004.
-- Foto bukti penyelesaian ("after") yang diunggah Tim Lapangan
-- lewat PUT /api/tugas/:id/selesai disimpan di kolom ini.
-- =====================================================================

alter table public.perbaikan
  add column if not exists foto_after_url text;

comment on column public.perbaikan.foto_after_url is 'URL publik foto bukti penyelesaian (after) di bucket foto-laporan';
