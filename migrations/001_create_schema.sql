-- =====================================================================
-- Migrasi 001: Skema database Kawal Fasilitas
-- Jalankan di Supabase Dashboard > SQL Editor
-- Tabel: users, laporan, perbaikan
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabel: users
-- ---------------------------------------------------------------------
create table public.users (
  id            uuid primary key default gen_random_uuid(),
  nama          varchar(100) not null,
  email         varchar(255) not null unique,
  password_hash text         not null,
  role          text         not null default 'pelapor'
                  check (role in ('admin', 'teknisi', 'pelapor')),
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

comment on table  public.users is 'Akun pengguna: admin, teknisi, pelapor';
comment on column public.users.role is 'admin | teknisi | pelapor';

-- ---------------------------------------------------------------------
-- Tabel: laporan (laporan kerusakan fasilitas)
-- ---------------------------------------------------------------------
create table public.laporan (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid         not null references public.users(id) on delete cascade,
  judul       varchar(200) not null,
  deskripsi   text         not null,
  lokasi      varchar(255) not null,
  kategori    varchar(100),
  foto_url    text,
  status      text         not null default 'pending'
                check (status in ('pending', 'diverifikasi', 'dalam_perbaikan', 'selesai', 'ditolak')),
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

comment on table  public.laporan is 'Laporan kerusakan fasilitas dari pelapor';
comment on column public.laporan.status is 'pending | diverifikasi | dalam_perbaikan | selesai | ditolak';

-- ---------------------------------------------------------------------
-- Tabel: perbaikan (tindak lanjut perbaikan atas sebuah laporan)
-- ---------------------------------------------------------------------
create table public.perbaikan (
  id              uuid primary key default gen_random_uuid(),
  laporan_id      uuid         not null references public.laporan(id) on delete cascade,
  teknisi_id      uuid         references public.users(id) on delete set null,
  status          text         not null default 'dijadwalkan'
                    check (status in ('dijadwalkan', 'dikerjakan', 'selesai', 'dibatalkan')),
  tanggal_mulai   date,
  tanggal_selesai date,
  biaya           numeric(12, 2) not null default 0,
  catatan         text,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

comment on table  public.perbaikan is 'Riwayat perbaikan untuk tiap laporan (1 laporan bisa punya banyak perbaikan)';
comment on column public.perbaikan.status is 'dijadwalkan | dikerjakan | selesai | dibatalkan';

-- ---------------------------------------------------------------------
-- Index untuk foreign key & filter status
-- ---------------------------------------------------------------------
create index idx_laporan_user_id   on public.laporan (user_id);
create index idx_laporan_status    on public.laporan (status);
create index idx_perbaikan_laporan on public.perbaikan (laporan_id);
create index idx_perbaikan_teknisi on public.perbaikan (teknisi_id);
create index idx_perbaikan_status  on public.perbaikan (status);

-- ---------------------------------------------------------------------
-- Trigger: updated_at otomatis
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger trg_laporan_updated_at
  before update on public.laporan
  for each row execute function public.set_updated_at();

create trigger trg_perbaikan_updated_at
  before update on public.perbaikan
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- RLS: aktifkan. Server memakai service_role key (bypass RLS),
-- sehingga tanpa policy pun akses server tetap jalan dan akses
-- publik/anon key tertutup total.
-- ---------------------------------------------------------------------
alter table public.users     enable row level security;
alter table public.laporan   enable row level security;
alter table public.perbaikan enable row level security;

-- =====================================================================
-- Relasi (ERD ringkas):
--
--   users 1───N laporan        (users.id → laporan.user_id)
--   laporan 1───N perbaikan    (laporan.id → perbaikan.laporan_id)
--   users 1───N perbaikan      (users.id → perbaikan.teknisi_id)
-- =====================================================================
