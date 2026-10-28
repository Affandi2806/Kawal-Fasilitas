# Kawal Fasilitas — Backend (Express.js + Supabase)

Backend API untuk aplikasi monitoring & pelaporan fasilitas.
Issue: [Affandi2806/Kawal-Fasilitas#6](https://github.com/Affandi2806/Kawal-Fasilitas/issues/6)

## Arsitektur

```
src/
├── server.js                  # entry point
├── app.js                     # express app (untuk test / reuse)
├── config/
│   ├── supabase.js            # Supabase client (service_role)
│   └── storage.js             # Upload foto ke bucket + URL publik
├── routes/                    # definisi endpoint
│   ├── auth.routes.js         # POST /register, /login; GET /me
│   ├── users.routes.js
│   ├── laporan.routes.js      # + GET /warga/:id, POST multipart foto
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
│   ├── upload.js              # multer: foto max 5 MB, JPG/PNG/WebP
│   └── errorHandler.js
└── utils/
    └── jwt.js                 # signToken / verifyToken
migrations/
├── 001_create_schema.sql      # skema users, laporan, perbaikan
├── 002_align_roles.sql        # role -> warga | admin | tim_lapangan
└── 003_laporan_gps.sql        # kolom latitude, longitude di laporan
```

## Setup

```bash
cd backend
npm install
cp .env.example .env
# isi SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET,
# dan SUPABASE_STORAGE_BUCKET di .env
# JWT_SECRET acak: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm run dev    # development (auto-reload)
npm start      # production
```

## Storage Foto (Supabase Storage)

Buat bucket **sebelum** memakai upload foto (satu kali, di Dashboard):

1. Supabase Dashboard → Storage → New bucket
2. Nama: `foto-laporan`, centang **Public** (foto kerusakan fasilitas memang untuk dilihat publik), Create
3. Tidak perlu policy upload — server memakai service_role key yang bypass RLS Storage

Foto diunggah ke path `laporan/<user_id>/<timestamp>-<random>.<ext>`, URL publiknya disimpan di kolom `foto_url`.

## Database

Jalankan di Supabase Dashboard → SQL Editor, **berurutan**:

1. `migrations/001_create_schema.sql` — tabel `users`, `laporan`, `perbaikan`
2. `migrations/002_align_roles.sql` — selaraskan role ke `warga | admin | tim_lapangan`
3. `migrations/003_laporan_gps.sql` — tambah kolom `latitude` dan `longitude` di `laporan`

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
| GET    | /api/laporan/warga/:id | Riwayat laporan satu warga (warga: milik sendiri; admin: siapa saja) |
| GET    | /api/laporan/:id     | Detail laporan (+ data pelapor)    |
| POST   | /api/laporan         | Buat laporan baru (multipart/form-data: field `foto` + `latitude`/`longitude`) |
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
| POST   | /api/auth/login      | Publik → balikan `{ success: true, data: { user, token } }` |
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

## Unggah Laporan (multipart)

`POST /api/laporan` menerima `multipart/form-data`:

| Field | Wajib | Keterangan |
|---|---|---|
| `foto` | Tidak | File gambar (JPG/PNG/WebP, maks 5 MB). Diunggah ke bucket `foto-laporan`, URL publiknya disimpan di `foto_url`. Kalau tidak ada file, `foto_url` dari body tetap dipakai (kompatibel dengan frontend lama). |
| `judul`, `deskripsi`, `lokasi` | Ya | Teks laporan |
| `kategori` | Tidak | Kategori fasilitas |
| `latitude`, `longitude` | Tidak | Koordinat GPS (`-90 s.d. 90` / `-180 s.d. 180`), disimpan di kolom `latitude`/`longitude` |

Contoh (curl):

```bash
curl -X POST http://localhost:3000/api/laporan \
  -H "Authorization: <redacted>" \
  -F "judul=Jalan berlubang" \
  -F "deskripsi=Lubang besar di tengah jalan" \
  -F "lokasi=Jl. Merdeka No. 10" \
  -F "kategori=jalan" \
  -F "latitude=-7.8167" \
  -F "longitude=112.0167" \
  -F "foto=@/path/ke/foto.jpg"
```
