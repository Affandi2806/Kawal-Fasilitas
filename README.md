# Kawal Fasilitas — Backend (Express.js + Supabase)

Backend API untuk aplikasi monitoring & pelaporan fasilitas.
Issue: [Affandi2806/Kawal-Fasilitas#6](https://github.com/Affandi2806/Kawal-Fasilitas/issues/6)

## Arsitektur

```
src/
├── server.js                  # entry point
├── app.js                     # express app (untuk test / reuse)
├── config/
│   └── supabase.js            # Supabase client (service_role)
├── routes/                    # definisi endpoint
│   ├── users.routes.js
│   ├── laporan.routes.js
│   └── perbaikan.routes.js
├── controllers/               # logika request/response + validasi
│   ├── users.controller.js
│   ├── laporan.controller.js
│   └── perbaikan.controller.js
├── models/                    # query ke Supabase per tabel
│   ├── users.model.js
│   ├── laporan.model.js
│   └── perbaikan.model.js
└── middlewares/
    └── errorHandler.js
migrations/
└── 001_create_schema.sql      # skema users, laporan, perbaikan
```

## Setup

```bash
cd server
npm install
cp .env.example .env
# isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env
npm run dev    # development (auto-reload)
npm start      # production
```

## Database

Jalankan `migrations/001_create_schema.sql` di Supabase Dashboard → SQL Editor.
Membuat tabel `users`, `laporan`, `perbaikan` beserta index, trigger
`updated_at`, dan RLS (akses hanya via service_role key milik server).

Relasi:

- `users 1—N laporan` (`laporan.user_id`)
- `laporan 1—N perbaikan` (`perbaikan.laporan_id`)
- `users 1—N perbaikan` (`perbaikan.teknisi_id`)

## Endpoint

| Method | Endpoint             | Deskripsi                          |
|--------|----------------------|------------------------------------|
| GET    | /health              | Cek status server                  |
| GET    | /api/users           | List semua user                    |
| GET    | /api/users/:id       | Detail user                        |
| POST   | /api/users           | Registrasi user (hash bcrypt)      |
| PATCH  | /api/users/:id       | Update user                        |
| DELETE | /api/users/:id       | Hapus user                         |
| GET    | /api/laporan         | List laporan (?status=, ?user_id=) |
| GET    | /api/laporan/:id     | Detail laporan (+ data pelapor)    |
| POST   | /api/laporan         | Buat laporan baru                  |
| PATCH  | /api/laporan/:id     | Update laporan / status            |
| DELETE | /api/laporan/:id     | Hapus laporan                      |
| GET    | /api/perbaikan       | List (?status=, ?laporan_id=, ?teknisi_id=) |
| GET    | /api/perbaikan/:id   | Detail (+ laporan & teknisi)       |
| POST   | /api/perbaikan       | Catat perbaikan baru               |
| PATCH  | /api/perbaikan/:id   | Update perbaikan / status          |
| DELETE | /api/perbaikan/:id   | Hapus data perbaikan               |

Role: `admin | teknisi | pelapor`.
Status laporan: `pending | diverifikasi | dalam_perbaikan | selesai | ditolak`.
Status perbaikan: `dijadwalkan | dikerjakan | selesai | dibatalkan`.
