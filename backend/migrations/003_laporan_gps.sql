-- =====================================================================
-- Migrasi 003: Tambah koordinat GPS di tabel laporan
-- Jalankan di Supabase Dashboard > SQL Editor SETELAH migrasi 002.
-- =====================================================================

alter table public.laporan
  add column if not exists latitude  double precision,
  add column if not exists longitude double precision;

comment on column public.laporan.latitude is 'Lintang lokasi laporan (-90 s.d. 90)';
comment on column public.laporan.longitude is 'Bujur lokasi laporan (-180 s.d. 180)';
