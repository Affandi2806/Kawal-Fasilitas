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
│   ├── auth.routes.js         # POST /register, /login; GET /me
│   ├── users.routes.js
│   ├── laporan.routes.js
│   └── perbaikan.routes.js
├── controllers/               # logika request/response + validasi
│   ├── auth.controller.js     # register (paksa warga) / login / me
│   ├── users.controller.js
│   ├── laporan.controller.js
│   └── perbaikan.controller.js
├── models/                    # query ke Supabase per tabel
│   ├── users.model.js
│   ├── laporan.model.js
│   └── perbaikan.model.js
├── middlewares/
│   ├── auth.js                # authenticate (Bearer JWT) + authorize(...role)
│   └── errorHandler.js
└── utils/
    └── jwt.js                 # signToken / verifyToken
migrations/
├── 001_create_schema.sql      # skema users, laporan, perbaikan
└── 002_align_roles.sql        # role -> warga | admin | tim_lapangan
```

## Setup

```bash
cd backend
npm install
cp .env.example .env
# isi SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, dan JWT_SECRET di .env
# JWT_SECRET acak: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm run dev    # development (auto-reload)
npm start      # production
```

## Database

Jalankan di Supabase Dashboard → SQL Editor, **berurutan**:

1. `migrations/001_create_schema.sql` — tabel `users`, `laporan`, `perbaikan`
2. `migrations/002_align_roles.sql` — selaraskan role ke `warga | admin | tim_lapangan`

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

Role: `warga | admin | tim_lapangan`.
Status laporan: `pending | diverifikasi | dalam_perbaikan | selesai | ditolak`.
Status perbaikan: `dijadwalkan | dikerjakan | selesai | dibatalkan`.

## Autentikasi & Otorisasi

JWT manual (jsonwebtoken). Password di-hash dengan bcrypt.

| Method | Endpoint             | Akses                          |
|--------|----------------------|--------------------------------|
| POST   | /api/auth/register   | Publik → selalu role `warga`   |
| POST   | /api/auth/login      | Publik → balikan `{ user, token }` |
| GET    | /api/auth/me         | Token                          |

Kirim token di setiap request terproteksi:

```
Authorization: Bearer <token>
```

Matriks akses:

| Resource              | warga | tim_lapangan | admin |
|-----------------------|-------|--------------|-------|
| Lihat/buat laporan    | ✅    | ✅           | ✅    |
| Ubah status laporan   | ❌    | ✅           | ✅    |
| Hapus laporan         | ❌    | ❌           | ✅    |
| Disposisi perbaikan (POST) | ❌ | ❌        | ✅    |
| Update progres perbaikan   | ❌ | ✅        | ✅    |
| Manajemen users       | ❌    | ❌           | ✅    |

Akun `admin`/`tim_lapangan` dibuat oleh admin via `POST /api/users`
(dengan token admin). `user_id` pada laporan selalu diambil dari token,
tidak bisa dipalsukan via body request.
