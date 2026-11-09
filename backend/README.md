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
│   ├── perbaikan.routes.js
│   └── tugas.routes.js        # GET /tugas/:tim_id, PUT /tugas/:id/selesai
├── controllers/               # logika request/response + validasi
│   ├── auth.controller.js     # register (paksa warga) / login / me
│   ├── users.controller.js
│   ├── laporan.controller.js
│   ├── perbaikan.controller.js
│   └── tugas.controller.js    # tugas aktif + laporkan selesai + trigger laporan Selesai
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
├── 003_laporan_gps.sql        # kolom latitude, longitude di laporan
├── 004_laporan_alasan_penolakan.sql # kolom alasan_penolakan di laporan
└── 005_perbaikan_foto_after.sql # kolom foto_after_url di perbaikan
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
4. `migrations/004_laporan_alasan_penolakan.sql` — tambah kolom `alasan_penolakan` di `laporan`
5. `migrations/005_perbaikan_foto_after.sql` — tambah kolom `foto_after_url` di `perbaikan`

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
| GET    | /api/laporan/all     | Dasbor admin: semua laporan, terbaru dulu (?status=) |
| GET    | /api/laporan/warga/:id | Riwayat laporan satu warga (warga: milik sendiri; admin: siapa saja) |
| GET    | /api/laporan/:id     | Detail laporan (+ data pelapor)    |
| POST   | /api/laporan         | Buat laporan baru (multipart/form-data: field `foto` + `latitude`/`longitude`) |
| PATCH  | /api/laporan/:id     | Update laporan / status (menolak wajib beralasan) |
| PUT    | /api/laporan/:id/status | Validasi admin: Diproses / Ditolak (+ alasan penolakan) |
| POST   | /api/laporan/:id/disposisi | Disposisi admin: tugaskan ke Tim Lapangan |
| DELETE | /api/laporan/:id     | Hapus laporan                      |
| GET    | /api/perbaikan       | List (?status=, ?laporan_id=, ?teknisi_id=) |
| GET    | /api/perbaikan/:id   | Detail (+ laporan & teknisi)       |
| POST   | /api/perbaikan       | Catat perbaikan baru               |
| PATCH  | /api/perbaikan/:id   | Update perbaikan / status          |
| DELETE | /api/perbaikan/:id   | Hapus data perbaikan               |
| GET    | /api/tugas/:tim_id   | Tugas aktif satu teknisi (dijadwalkan/dikerjakan, terbaru dulu) |
| PUT    | /api/tugas/:id/selesai | Laporkan penyelesaian + foto after (multipart field `foto_after`) |

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
| Validasi status (PUT /:id/status) | ❌ | ❌      | ✅    |
| Dasbor admin (GET /all) | ❌   | ❌           | ✅    |
| Disposisi ke Tim Lapangan | ❌  | ❌           | ✅    |
| Hapus laporan         | ❌    | ❌           | ✅    |
| Disposisi perbaikan (POST) | ❌ | ❌        | ✅    |
| Update progres perbaikan   | ❌ | ✅        | ✅    |
| Lihat tugas aktif (GET /tugas/:tim_id) | ❌ | ✅ (milik sendiri) | ✅ |
| Laporkan penyelesaian (PUT /tugas/:id/selesai) | ❌ | ✅ (tugas sendiri) | ✅ |
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

## Validasi & Disposisi Admin

Alur: `pending` → admin validasi (`PUT /:id/status`) → `diverifikasi`
→ admin disposisi (`POST /:id/disposisi`) → `dalam_perbaikan` → `selesai`.
"Diproses" di issue = `diverifikasi` (frontend memetakan `diverifikasi` dan
`dalam_perbaikan` ke label "Diproses").

| Endpoint | Admin saja | Body | Hasil |
|---|---|---|---|
| `GET /api/laporan/all` | ✅ | — | Semua laporan, terbaru dulu; filter `?status=` |
| `PUT /api/laporan/:id/status` | ✅ | `{ "status": "Diproses" \| "Ditolak", "alasan_penolakan": "..." }` | Status jadi `diverifikasi` / `ditolak` |
| `POST /api/laporan/:id/disposisi` | ✅ | `{ "tim_lapangan_id": "<uuid user>" }` | Baris `perbaikan` baru (status `dijadwalkan`) + laporan jadi `dalam_perbaikan` |

Aturan:

- `PUT /:id/status` hanya menerima `Diproses` / `Ditolak` (alias
  `diverifikasi` / `ditolak` juga diterima). `alasan_penolakan` **wajib**
  saat menolak; saat diproses, alasan lama dibersihkan. Alasan tampil di
  halaman Riwayat saat status `ditolak`.
- `selesai` adalah status terminal: laporan yang sudah `selesai` tidak
  bisa diubah statusnya lagi, baik lewat `PUT /:id/status` maupun `PATCH`.
- `PATCH /:id` mengikuti aturan yang sama — bukan jalan pintas: menolak
  lewat PATCH juga wajib beralasan, dan status lain membersihkan alasan
  lama. Mengubah field lain (judul, deskripsi, lokasi, dst.) tetap bisa
  di laporan yang sudah selesai.
- `POST /:id/disposisi` hanya menerima laporan berstatus `diverifikasi`
  (baru divalidasi) atau `dalam_perbaikan` (ganti Tim Lapangan).
  Laporan `pending` harus divalidasi dulu; yang `ditolak` / `selesai`
  tidak bisa didisposisikan. `tim_lapangan_id` harus user yang ada dan
  ber-role `tim_lapangan`. Satu laporan boleh punya banyak baris perbaikan.
- Disposisi tidak atomik (supabase-js tidak punya transaksi antar
  panggil): status laporan diubah dulu, baru baris perbaikan dibuat.
  Kalau pembuatan baris perbaikan gagal, status laporan dikembalikan
  ke semula (kompensasi) supaya laporan tidak menggantung tanpa tugas,
  dan disposisi bisa diulang dengan aman.

Contoh (curl, token admin):

```bash
# Dasbor admin
curl http://localhost:3000/api/laporan/all \
  -H "Authorization: Bearer TOKEN_ADMIN"

# Validasi: proses
curl -X PUT http://localhost:3000/api/laporan/<id>/status \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"status":"Diproses"}'

# Validasi: tolak (alasan wajib)
curl -X PUT http://localhost:3000/api/laporan/<id>/status \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"status":"Ditolak","alasan_penolakan":"Foto tidak jelas, mohon unggah ulang"}'

# Disposisi ke Tim Lapangan
curl -X POST http://localhost:3000/api/laporan/<id>/disposisi \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"tim_lapangan_id":"<uuid-tim-lapangan>"}'
```

## Eksekusi Perbaikan (Tim Lapangan)

Alur lanjutan: `dalam_perbaikan` → Tim Lapangan menyelesaikan tugas
(`PUT /tugas/:id/selesai`) → laporan jadi `selesai`.

| Endpoint | Akses | Body | Hasil |
|---|---|---|---|
| `GET /api/tugas/:tim_id` | admin (siapa saja) / tim_lapangan (milik sendiri) | — | Tugas aktif teknisi itu: status `dijadwalkan` / `dikerjakan` saja, terbaru dulu, lengkap dengan laporan terkait |
| `PUT /api/tugas/:id/selesai` | teknisi yang ditugaskan / admin | multipart field `foto_after` (atau `foto_after_url` di body JSON) + `catatan` opsional | Perbaikan jadi `selesai` + `tanggal_selesai` terisi + laporan terkait jadi `selesai` |

Aturan:

- **Foto after wajib.** Tanpa file `foto_after` maupun `foto_after_url`
  → 400. Foto diunggah ke bucket `foto-laporan` (path
  `perbaikan/<perbaikan_id>/after-<timestamp>-<random>.<ext>`), URL
  publiknya disimpan di kolom `foto_after_url` (migrasi 005).
- **Trigger laporan Selesai.** Laporan terkait berubah menjadi `selesai`
  hanya bila data perbaikan sudah lengkap: status `selesai` +
  `tanggal_selesai` terisi + `foto_after_url` ada, dan laporan saat ini
  `dalam_perbaikan`. Trigger yang sama juga berjalan di
  `PATCH /api/perbaikan/:id` — jadi alur lama frontend (PATCH
  `{status: "selesai", tanggal_selesai}`) ikut memicu laporan Selesai,
  tapi hanya bila foto after sudah tercatat; tanpa foto, laporan tetap
  `dalam_perbaikan`. Tidak ada trigger di database (PostgREST tidak
  punya transaksi antar-panggil); logikanya di controller.
- **Idempotent.** Menyelesaikan tugas yang sudah `selesai` boleh diulang
  (ganti foto / catatan). Tugas `dibatalkan` tidak bisa diselesaikan.
- `tanggal_selesai` diisi server (waktu request diterima), bukan dari
  client. `catatan` opsional; bila tidak dikirim, catatan lama dipertahankan.

Contoh (curl, token tim lapangan):

```bash
# Tugas aktif saya
curl http://localhost:3000/api/tugas/<id-tim-lapangan> \
  -H "Authorization: Bearer TOKEN_TIM"

# Laporkan penyelesaian + foto after
curl -X PUT http://localhost:3000/api/tugas/<id-perbaikan>/selesai \
  -H "Authorization: Bearer TOKEN_TIM" \
  -F "foto_after=@/path/ke/foto-after.jpg" \
  -F "catatan=Lampu sudah diganti"
```

Catatan untuk frontend (halaman Tim Lapangan, PR #21): halaman itu
sekarang menyimpan foto bukti hanya di state klien karena backend belum
punya kolom foto — kolomnya sekarang ada (`foto_after_url` di respons
`Perbaikan`, migrasi 005). Tambahkan `foto_after_url: string | null`
ke interface `Perbaikan` di `frontend/src/lib/api.ts`, dan alihkan
`selesaikanPerbaikan` dari `PATCH /api/perbaikan/:id` ke
`PUT /api/tugas/:id/selesai` dengan FormData berisi file foto agar
foto after benar-benar terkirim dan laporan otomatis jadi Selesai.
