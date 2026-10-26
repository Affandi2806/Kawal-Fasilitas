-- =====================================================================
-- Migrasi 002: Selaraskan role dengan spec issue (Warga, Admin, Tim Lapangan)
-- Jalankan di Supabase Dashboard > SQL Editor SETELAH migrasi 001.
-- =====================================================================

-- Petakan nilai lama ke nilai baru
update public.users set role = 'warga'        where role = 'pelapor';
update public.users set role = 'tim_lapangan' where role = 'teknisi';

-- Ganti check constraint
alter table public.users drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check
  check (role in ('warga', 'admin', 'tim_lapangan'));

comment on column public.users.role is 'warga | admin | tim_lapangan';
