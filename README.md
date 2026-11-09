# Kawal-Fasilitas 🏘️🛠️

Kawal-Fasilitas adalah platform berbasis Progressive Web App (PWA) dan cloud computing yang dirancang untuk menjembatani interaksi antara warga dan pemerintah desa/kelurahan. Aplikasi ini mendigitalisasi siklus pelaporan kerusakan fasilitas umum mulai dari unggahan kerusakan oleh warga, validasi oleh perangkat desa, hingga konfirmasi perbaikan oleh tim lapangan.

**Status Proyek:** v0.1 — MVP dalam pengembangan aktif
**Dikembangkan oleh:**

| Anggota | Peran |
| --- | --- |
| [Ahmad Affandi Dwi Andoko](https://github.com/Affandi2806) (@Affandi2806) | Repo Owner |
| [Muhamad Ilham Fathony Sulton](https://github.com/Edzard9) (@Edzard9) | Frontend |
| [Mochammad Rizky Hendriyan Syah](https://github.com/Rizky2615) (@Rizky2615) | Backend |

---

## 🎯 Tujuan Utama

- **Kemudahan Akses:** Menyediakan saluran pelaporan kerusakan fasilitas umum yang mudah diakses warga melalui PWA tanpa perlu instalasi rumit.
- **Transparansi:** Memberikan pemantauan progres perbaikan secara real-time kepada pelapor.
- **Efisiensi:** Meningkatkan efisiensi disposisi tugas dan akuntabilitas kerja dari Tim Lapangan.

---

## 👥 Pengguna & Fitur Utama

Sistem ini membagi akses menjadi tiga peran utama (Role: `warga | admin | tim_lapangan`):

### 1. Warga (Pelapor)

- **Lapor Kerusakan:** Mengunggah foto kerusakan fasilitas umum (jalan berlubang, lampu mati, dll). ✅ Sudah ada — halaman `/lapor` (form + foto + geotagging otomatis).
- **Geotagging Otomatis:** Sistem otomatis merekam titik koordinat lokasi (GPS) bersamaan dengan foto. ✅ Sudah ada — `navigator.geolocation` (high accuracy) di halaman `/lapor`.
- **Lacak Laporan:** Memantau status laporan secara real-time. ✅ Sudah ada — halaman `/riwayat` (daftar + badge status + alasan penolakan, auto-refresh tiap 30 detik).

### 2. Admin Kelurahan/Desa (Verifikator)

- **Validasi Laporan:** Melihat dan memvalidasi daftar laporan masuk dari warga. ✅ Sudah ada — halaman Dasbor Admin (`/admin`) + API `PUT /api/laporan/:id/status` (Diproses / Ditolak, alasan penolakan wajib saat menolak).
- **Manajemen Status:** Mengubah status laporan menjadi "diverifikasi" atau "dalam_perbaikan", atau "ditolak" (dilengkapi alasan penolakan). ✅ API sudah ada — `PUT /api/laporan/:id/status` (hanya admin); `PATCH /api/laporan/:id` (admin & tim lapangan) untuk field lainnya.
- **Disposisi Tugas:** Mendisposisikan tugas perbaikan ke entitas Tim Lapangan. ✅ API sudah ada — `POST /api/laporan/:id/disposisi` (hanya admin): membuat baris perbaikan + laporan jadi `dalam_perbaikan`.

### 3. Tim Lapangan (Eksekutor)

- **Penerimaan Tugas:** Menerima rincian tugas perbaikan beserta titik koordinat lokasi. ✅ Sudah ada — halaman `/tim-lapangan` (daftar tugas aktif & selesai) + API `GET /api/tugas/:tim_id`.
- **Laporan Selesai:** Mengunggah foto bukti hasil perbaikan (after). Sistem otomatis mengubah status laporan menjadi "Selesai". ✅ Sudah ada — `PUT /api/tugas/:id/selesai` (foto after wajib; kalau perbaikan lengkap, laporan otomatis jadi `selesai`).

---

## 🔄 Alur Kerja Sistem (Workflow)

1. **Lapor:** Warga memotret kerusakan ➔ Sistem merekam GPS ➔ Laporan masuk (Status: *pending*).
2. **Validasi & Disposisi:** Admin meninjau laporan ➔ Menyetujui & Memilih Tim Lapangan (Status: *diverifikasi* / *dalam_perbaikan*).
   *(Catatan: Jika ditolak, Admin wajib memberikan alasan dan status menjadi ditolak).*
3. **Eksekusi:** Tim Lapangan memperbaiki fasilitas ➔ Mengunggah foto bukti perbaikan ➔ Laporan selesai (Status: *selesai*).

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

| Lapisan | Teknologi |
| --- | --- |
| **Frontend** | Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4, PWA (`@ducanh2912/next-pwa`), font Plus Jakarta Sans |
| **Backend** | Express.js (Node.js, ESM) + JWT manual (jsonwebtoken, password di-hash dengan bcrypt) |
| **Database / Cloud** | Supabase (PostgreSQL, Service Role untuk akses server, Storage) |
| **CI/CD** | GitHub Actions (`.github/workflows/ci.yml`) |
| **Integrasi Pihak Ketiga** | Maps API (untuk visualisasi lokasi) & Cloud Storage (untuk aset foto) |

---

## 📁 Struktur Monorepo

```text
.
├── frontend/                  # Aplikasi Next.js (PWA, mobile-first)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Beranda (hero + alur kerja MVP)
│   │   │   ├── lapor/
│   │   │   │   └── page.tsx   # Form lapor: foto, kategori, deskripsi, GPS
│   │   │   ├── riwayat/
│   │   │   │   └── page.tsx   # Riwayat laporan warga (badge status, alasan penolakan)
│   │   │   ├── tim-lapangan/
│   │   │   │   └── page.tsx   # Daftar tugas + form selesaikan tugas
│   │   │   ├── admin/
│   │   │   │   └── page.tsx   # Dasbor admin: validasi & disposisi
│   │   │   ├── login/
│   │   │   │   └── page.tsx   # Halaman login pegawai (redirect sesuai role)
│   │   │   ├── layout.tsx     # Metadata + font Plus Jakarta Sans
│   │   │   └── globals.css
│   │   └── lib/
│   │       └── api.ts         # Client API ke backend (lihat ⚠️ Status Integrasi)
│   ├── public/
│   │   ├── manifest.json      # PWA manifest ("KawalFas")
│   │   └── icons/             # Ikon PWA (192, 512, maskable, apple-touch)
│   ├── package.json           # next 15.5.4, react 19, tailwindcss 4
│   └── next.config.ts
├── backend/                   # API Express.js (lihat backend/README.md untuk detail)
│   ├── src/
│   │   ├── server.js          # Entry point
│   │   ├── app.js             # Express app (untuk test / reuse)
│   │   ├── config/
│   │   │   ├── supabase.js    # Supabase client (service_role)
│   │   │   └── storage.js     # Upload foto ke bucket + URL publik
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # POST /register, /login; GET /me
│   │   │   ├── users.routes.js
│   │   │   ├── laporan.routes.js  # + GET /all, /warga/:id, PUT /:id/status, POST /:id/disposisi
│   │   │   ├── perbaikan.routes.js
│   │   │   └── tugas.routes.js    # GET /tugas/:tim_id, PUT /tugas/:id/selesai
│   │   ├── controllers/
│   │   │   ├── auth.controller.js # register (paksa warga) / login / me
│   │   │   ├── users.controller.js
│   │   │   ├── laporan.controller.js
│   │   │   ├── perbaikan.controller.js
│   │   │   └── tugas.controller.js # tugas aktif + laporkan selesai + trigger laporan Selesai
│   │   ├── models/            # Query ke Supabase per tabel
│   │   ├── middlewares/
│   │   │   ├── auth.js        # authenticate (Bearer <token>) + authorize(...role)
│   │   │   ├── upload.js      # multer: foto JPG/PNG/WebP, maks 5 MB
│   │   │   └── errorHandler.js
│   │   └── utils/
│   │       └── jwt.js         # signToken / verifyToken
│   ├── migrations/
│   │   ├── 001_create_schema.sql  # Skema users, laporan, perbaikan
│   │   ├── 002_align_roles.sql    # Role -> warga | admin | tim_lapangan
│   │   ├── 003_laporan_gps.sql    # Kolom latitude/longitude di laporan
│   │   ├── 004_laporan_alasan_penolakan.sql  # Kolom alasan_penolakan di laporan
│   │   └── 005_perbaikan_foto_after.sql      # Kolom foto_after_url di perbaikan
│   └── package.json
├── docs/
├── prd_kawal_fasilitas.md     # Product Requirements Document v0.1
└── .github/
    └── workflows/ci.yml       # Automated Code Checker (Node 18)
```

---

## 🚀 Setup & Menjalankan

### Prasyarat

- Node.js 18+ dan npm
- Akun Supabase (URL proyek + Service Role Key)

### 1. Clone repo

```bash
git clone https://github.com/Affandi2806/Kawal-Fasilitas.git
cd Kawal-Fasilitas
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# isi di file .env:
#   SUPABASE_URL=https://xyzcompany.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY=isi_dengan_service_role_key
#   JWT_SECRET=<isi-dengan-jwt-secret-acak>
#   JWT_EXPIRES_IN=7d
#   PORT=3000
# JWT_SECRET acak: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm run dev    # development (auto-reload) di http://localhost:3000
npm start      # production
```

Jalankan migrasi **berurutan** di Supabase Dashboard → SQL Editor:

1. `backend/migrations/001_create_schema.sql` — tabel `users`, `laporan`, dan `perbaikan` beserta index, trigger `updated_at`, dan RLS (akses hanya via *service_role key* milik server).
2. `backend/migrations/002_align_roles.sql` — selaraskan role ke `warga | admin | tim_lapangan` (memetakan nilai lama `pelapor` → `warga` dan `teknisi` → `tim_lapangan`).
3. `backend/migrations/003_laporan_gps.sql` — kolom `latitude` / `longitude` (double precision) di tabel `laporan`.
4. `backend/migrations/004_laporan_alasan_penolakan.sql` — kolom `alasan_penolakan` (text) di tabel `laporan`, dipakai endpoint validasi.
5. `backend/migrations/005_perbaikan_foto_after.sql` — kolom `foto_after_url` (text) di tabel `perbaikan`, dipakai endpoint eksekusi perbaikan.

### 3. Frontend

```bash
cd frontend
npm install
# Buat file .env.local (opsional — defaultnya http://localhost:3000):
#   NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev    # development di http://localhost:3001 (lihat catatan port)
npm run build  # build production
npm start      # jalankan hasil build
```

> **Catatan port:** backend dan `next dev` sama-sama default di port 3000, jadi keduanya tidak bisa jalan bersamaan di port yang sama. Jalankan backend di `:3000` dan frontend di port lain, misalnya `npm run dev -- -p 3001`. `NEXT_PUBLIC_API_URL` harus menunjuk ke alamat backend (`http://localhost:3000`).

---

## 🗄️ Database & Relasi

**Relasi Antar Tabel:**

- `users 1—N laporan` *(dihubungkan melalui&#32;`laporan.user_id`)*
- `laporan 1—N perbaikan` *(dihubungkan melalui&#32;`perbaikan.laporan_id`)*
- `users 1—N perbaikan` *(dihubungkan melalui&#32;`perbaikan.teknisi_id`)*

**Status Global:**

- **Status Laporan:** `pending | diverifikasi | dalam_perbaikan | selesai | ditolak`
- **Status Perbaikan:** `dijadwalkan | dikerjakan | selesai | dibatalkan`

---

## 🔐 Autentikasi & Otorisasi (Backend)

Autentikasi memakai JWT manual (jsonwebtoken), bukan Supabase Auth. Password di-hash dengan bcrypt. Setiap request terproteksi membawa token di header:

```
Authorization: Bearer <token>
```

| Method | Endpoint | Deskripsi | Akses |
| --- | --- | --- | --- |
| **GET** | `/health` | Cek status server | Publik |
| **POST** | `/api/auth/register` | Daftar akun baru (selalu role `warga`) | Publik |
| **POST** | `/api/auth/login` | Login, balikan `{ success: true, data: { user, token } }` | Publik |
| **GET** | `/api/auth/me` | Profil user dari token | Token |
| **GET** | `/api/users` | List semua user | Admin |
| **GET** | `/api/users/:id` | Detail user | Admin |
| **POST** | `/api/users` | Buat akun `admin` / `tim_lapangan` | Admin |
| **PATCH** | `/api/users/:id` | Update user | Admin |
| **DELETE** | `/api/users/:id` | Hapus user | Admin |
| **GET** | `/api/laporan` | List laporan *(Filter: ?status=, ?user_id=)* | Token |
| **GET** | `/api/laporan/all` | List semua laporan (dasbor admin) | Admin |
| **GET** | `/api/laporan/warga/:id` | Riwayat laporan satu warga | Warga (milik sendiri), Admin |
| **GET** | `/api/laporan/:id` | Detail laporan (+ data pelapor) | Token |
| **POST** | `/api/laporan` | Buat laporan baru (`user_id` dari token) | Token |
| **PATCH** | `/api/laporan/:id` | Update laporan / status | Admin, Tim Lapangan |
| **PUT** | `/api/laporan/:id/status` | Validasi: Diproses / Ditolak (+ alasan wajib saat menolak) | Admin |
| **POST** | `/api/laporan/:id/disposisi` | Disposisi ke Tim Lapangan | Admin |
| **DELETE** | `/api/laporan/:id` | Hapus laporan | Admin |
| **GET** | `/api/perbaikan` | List perbaikan *(Filter: ?status=, ?laporan_id=, ?teknisi_id=)* | Token |
| **GET** | `/api/perbaikan/:id` | Detail perbaikan (+ laporan & teknisi) | Token |
| **POST** | `/api/perbaikan` | Buat data perbaikan | Admin |
| **PATCH** | `/api/perbaikan/:id` | Update perbaikan / status | Admin, Tim Lapangan |
| **DELETE** | `/api/perbaikan/:id` | Hapus data perbaikan | Admin |
| **GET** | `/api/tugas/:tim_id` | Tugas aktif satu teknisi | Tim Lapangan (milik sendiri), Admin |
| **PUT** | `/api/tugas/:id/selesai` | Laporkan selesai + foto after (laporan otomatis jadi `selesai` bila lengkap) | Tim Lapangan (tugas sendiri), Admin |

### ⚠️ Status Integrasi Frontend ↔ Backend

Halaman login (`/login`) sudah ada: memanggil `POST /api/auth/login` dan menyimpan sesi + token di `localStorage` (kunci `kawal-sesi`), lalu redirect sesuai role. Yang masih dikerjakan (issue #24): pengiriman header `Authorization` di halaman-halaman lain (`/lapor`, `/riwayat`, `/tim-lapangan`, `/admin`) — halaman-halaman itu masih memakai data demo sampai integrasi JWT selesai. Sampai itu dikerjakan, form `/lapor` belum bisa membuat laporan ke backend yang sudah diproteksi (akan `401`).

---

## 🤖 CI (GitHub Actions)

Workflow `Automated Code Checker` (`.github/workflows/ci.yml`) berjalan di setiap push ke `main`/`dev` dan setiap pull request ke `main` (Node.js 18). Saat ini masih berupa pengecekan placeholder.

---

## 🌿 Branch & Kontribusi

- `main` — branch utama; semua perubahan masuk lewat pull request.
- `Backend` — pengembangan API Express.js.
- `Frontend` — pengembangan aplikasi Next.js.
- Alur kerja: buat branch dari `main` → kerjakan → buka pull request ke `main` → review tim → merge.

---

> *Dokumen ini berbasis pada Product Requirements Document (PRD) v0.1 per tanggal 9 Oktober 2026 dan dapat berubah seiring pengembangan lebih lanjut. Diperbarui 9 November 2026: mencakup halaman login, riwayat, tim lapangan, dan dasbor admin; endpoint validasi, disposisi, dan tugas; serta migrasi 003–005.*
