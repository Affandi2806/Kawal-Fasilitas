-- =====================================================================
-- Migrasi 004: Tambah alasan penolakan di tabel laporan
-- Jalankan di Supabase Dashboard > SQL Editor SETELAH migrasi 003.
-- Frontend (halaman Riwayat) sudah membaca kolom ini saat status ditolak.
-- =====================================================================

alter table public.laporan
  add column if not exists alasan_penolakan text;

comment on column public.laporan.alasan_penolakan is 'Alasan penolakan oleh admin (wajib saat status ditolak)';
