# Kawal-Fasilitas — Backend

REST API untuk sistem pelaporan & monitoring fasilitas umum desa/kelurahan.
Dibangun dengan Express.js + Supabase (PostgreSQL).

> Gambaran proyek keseluruhan (PWA, alur kerja, peran pengguna) ada di README utama repo.

---

## Tech Stack

- **Express.js 4** (Node.js, ESM)
- **Supabase** — PostgreSQL diakses via `service_role key` (bypass RLS secara sah, hanya dari server)
- **bcryptjs** — hash password user

---

## Struktur Direktori

```text
backend/
├── src/
│   ├── server.js                  # entry point (node src/server.js)
│   ├── app.js                     # express app (CORS, JSON, routes, error handler)
│   ├── config/
│   │   └── supabase.js            # Supabase client (service_role)
│   ├── routes/                    # definisi endpoint
│   │   ├── users.routes.js
│   │   ├── laporan.routes.js
│   │   └── perbaikan.routes.js
│   ├── controllers/               # logika request/response + validasi
│   │   ├── users.controller.js
│   │   ├── laporan.controller.js
│   │   └── perbaikan.controller.js
│   ├── models/                    # query ke Supabase per tabel
│   │   ├── users.model.js
│   │   ├── laporan.model.js
│   │   └── perbaikan.model.js
│   └── middlewares/
│       └── errorHandler.js        # format error + 404
├── migrations/
│   └── 001_create_schema.sql      # skema users, laporan, perbaikan
├── .env.example                   # contoh environment variable
└── package.json
```

---

## Setup & Menjalankan

```bash
cd backend
npm install
cp .env.example .env
# isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di file .env
npm run dev    # development (auto-reload)
npm start      # production
```

### Environment Variable

| Variable | Wajib | Default | Deskripsi |
| :--- | :---: | :--- | :--- |
| `SUPABASE_URL` | Ya | – | URL project Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Ya | – | Service role key (jangan expose ke frontend) |
| `PORT` | Tidak | `3000` | Port server |

> Catatan: Next.js dev server juga default port `3000`. Saat jalan bareng frontend secara lokal, set `PORT` backend ke nilai lain (misal `3001`).

---

## Database

Jalankan `migrations/001_create_schema.sql` di Supabase Dashboard → SQL Editor.

**Tabel:** `users`, `laporan`, `perbaikan` — beserta index, trigger `updated_at`, dan RLS.

**Relasi:**
- `users 1—N laporan` (via `laporan.user_id`)
- `laporan 1—N perbaikan` (via `perbaikan.laporan_id`)
- `users 1—N perbaikan` (via `perbaikan.teknisi_id`)

**Status yang valid:**
- Laporan: `pending | diverifikasi | dalam_perbaikan | selesai | ditolak`
- Perbaikan: `dijadwalkan | dikerjakan | selesai | dibatalkan`

---

## API Reference

Base URL default: `http://localhost:3000`

**Format response sukses:**

```json
{ "success": true, "data": { } }
```

**Format error:**

```json
{ "success": false, "message": "..." }
```

### Endpoint

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| GET | `/health` | Cek status server |
| GET | `/api/users` | List semua user |
| GET | `/api/users/:id` | Detail user |
| POST | `/api/users` | Registrasi user (password di-hash bcrypt) |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Hapus user |
| GET | `/api/laporan` | List laporan (filter: `?status=`, `?user_id=`) |
| GET | `/api/laporan/:id` | Detail laporan (+ data pelapor) |
| POST | `/api/laporan` | Buat laporan baru |
| PATCH | `/api/laporan/:id` | Update laporan / ubah status |
| DELETE | `/api/laporan/:id` | Hapus laporan |
| GET | `/api/perbaikan` | List perbaikan (filter: `?status=`, `?laporan_id=`, `?teknisi_id=`) |
| GET | `/api/perbaikan/:id` | Detail perbaikan (+ laporan & teknisi) |
| POST | `/api/perbaikan` | Catat perbaikan baru (disposisi) |
| PATCH | `/api/perbaikan/:id` | Update perbaikan / ubah status |
| DELETE | `/api/perbaikan/:id` | Hapus data perbaikan |

**Body `POST /api/laporan`** (field wajib: `user_id`, `judul`, `deskripsi`, `lokasi`):

```json
{
  "user_id": "uuid-user",
  "judul": "Jalan berlubang",
  "deskripsi": "Lubang besar di depan balai desa",
  "lokasi": "-7.123, 112.456",
  "kategori": "jalan",
  "foto_url": "https://.../foto.jpg"
}
```

---

## Kontrak Penting untuk Frontend

- **Foto dikirim sebagai URL string** (`foto_url`), bukan upload file. Frontend mengunggah foto (misal langsung ke Supabase Storage), lalu mengirim URL-nya ke API.
- **CORS terbuka** (`cors()`) — frontend di origin mana pun bisa memanggil API.
- **Role user saat ini:** `admin | teknisi | pelapor` (akan berubah menjadi `warga | admin | tim_lapangan` saat autentikasi diimplementasikan).
- **Autentikasi belum ada** — endpoint masih terbuka tanpa token. Implementasi JWT + RBAC menyusul.
