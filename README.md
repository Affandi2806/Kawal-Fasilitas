# Kawal-Fasilitas 🏘️🛠️

Kawal-Fasilitas adalah platform berbasis Progressive Web App (PWA) dan cloud computing yang dirancang untuk menjembatani interaksi antara warga dan pemerintah desa/kelurahan. Aplikasi ini mendigitalisasi siklus pelaporan kerusakan fasilitas umum mulai dari unggahan kerusakan oleh warga, validasi oleh perangkat desa, hingga konfirmasi perbaikan oleh tim lapangan.

**Status Proyek:** Draft Sementara (v0.1)
**Dikembangkan oleh:**

1. Ahmad Affandi Dwi Andoko
2. Muhamad Ilham Fathony Sulton
3. Mochammad Rizky Hendriyan Syah

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
- **Lacak Laporan:** Memantau status laporan secara real-time. 🚧 Sebagian — API backend sudah ada (`GET /api/laporan`), tombol "Pantau Laporan" di beranda masih placeholder.

### 2. Admin Kelurahan/Desa (Verifikator)

- **Validasi Laporan:** Melihat dan memvalidasi daftar laporan masuk dari warga. ✅ API sudah ada — backend; halaman admin di frontend belum ada.
- **Manajemen Status:** Mengubah status laporan menjadi "diverifikasi" atau "dalam\_perbaikan", atau "ditolak" (dilengkapi alasan penolakan). ✅ API sudah ada (`PATCH /api/laporan/:id`, hanya admin & tim lapangan).
- **Disposisi Tugas:** Mendisposisikan tugas perbaikan ke entitas Tim Lapangan. ✅ API sudah ada (`POST /api/perbaikan`, hanya admin).

### 3. Tim Lapangan (Eksekutor)

- **Penerimaan Tugas:** Menerima rincian tugas perbaikan beserta titik koordinat lokasi. ✅ API sudah ada (`GET /api/perbaikan`); halaman tim lapangan di frontend belum ada.
- **Laporan Selesai:** Mengunggah foto bukti hasil perbaikan (after). Sistem otomatis mengubah status laporan menjadi "Selesai". 🚧 API perbaikan sudah ada; alur otomatis ubah status laporan masih manual via `PATCH /api/laporan/:id`.

---

## 🔄 Alur Kerja Sistem (Workflow)

1. **Lapor:** Warga memotret kerusakan ➔ Sistem merekam GPS ➔ Laporan masuk (Status: *pending*).
2. **Validasi & Disposisi:** Admin meninjau laporan ➔ Menyetujui & Memilih Tim Lapangan (Status: *diverifikasi* / *dalam\_perbaikan*).
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
│   │   │   └── supabase.js    # Supabase client (service_role)
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # POST /register, /login; GET /me
│   │   │   ├── users.routes.js
│   │   │   ├── laporan.routes.js
│   │   │   └── perbaikan.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js # register (paksa warga) / login / me
│   │   │   ├── users.controller.js
│   │   │   ├── laporan.controller.js
│   │   │   └── perbaikan.controller.js
│   │   ├── models/            # Query ke Supabase per tabel
│   │   ├── middlewares/
│   │   │   ├── auth.js        # authenticate (Bearer JWT) + authorize(...role)
│   │   │   └── errorHandler.js
│   │   └── utils/
│   │       └── jwt.js         # signToken / verifyToken
│   ├── migrations/
│   │   ├── 001_create_schema.sql  # Skema users, laporan, perbaikan
│   │   └── 002_align_roles.sql    # Role -> warga | admin | tim_lapangan
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
#   JWT_SECRET=isi_dengan_string_acak_panjang
#   JWT_EXPIRES_IN=7d
#   PORT=3000
# JWT_SECRET acak: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm run dev    # development (auto-reload) di http://localhost:3000
npm start      # production
```

Jalankan migrasi **berurutan** di Supabase Dashboard → SQL Editor:

1. `backend/migrations/001_create_schema.sql` — tabel `users`, `laporan`, dan `perbaikan` beserta index, trigger `updated_at`, dan RLS (akses hanya via *service\_role key* milik server).
2. `backend/migrations/002_align_roles.sql` — selaraskan role ke `warga | admin | tim_lapangan` (memetakan nilai lama `pelapor` → `warga` dan `teknisi` → `tim_lapangan`).

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
Authorization: <redacted>
```

| Method | Endpoint | Deskripsi | Akses |
| --- | --- | --- | --- |
| **GET** | `/health` | Cek status server | Publik |
| **POST** | `/api/auth/register` | Daftar akun baru (selalu role `warga`) | Publik |
| **POST** | `/api/auth/login` | Login, balikan `{ user, token }` | Publik |
| **GET** | `/api/auth/me` | Profil user dari token | Token |
| **GET** | `/api/users` | List semua user | Admin |
| **GET** | `/api/users/:id` | Detail user | Admin |
| **POST** | `/api/users` | Buat akun `admin` / `tim_lapangan` | Admin |
| **PATCH** | `/api/users/:id` | Update user | Admin |
| **DELETE** | `/api/users/:id` | Hapus user | Admin |
| **GET** | `/api/laporan` | List laporan *(Filter: ?status=, ?user\_id=)* | Token |
| **GET** | `/api/laporan/:id` | Detail laporan (+ data pelapor) | Token |
| **POST** | `/api/laporan` | Buat laporan baru (`user_id` dari token) | Token |
| **PATCH** | `/api/laporan/:id` | Update laporan / status | Admin, Tim Lapangan |
| **DELETE** | `/api/laporan/:id` | Hapus laporan | Admin |
| **GET** | `/api/perbaikan` | List perbaikan *(Filter: ?status=, ?laporan\_id=, ?teknisi\_id=)* | Token |
| **GET** | `/api/perbaikan/:id` | Detail perbaikan (+ laporan & teknisi) | Token |
| **POST** | `/api/perbaikan` | Disposisi tugas ke Tim Lapangan | Admin |
| **PATCH** | `/api/perbaikan/:id` | Update perbaikan / status | Admin, Tim Lapangan |
| **DELETE** | `/api/perbaikan/:id` | Hapus data perbaikan | Admin |

### Kontrak Penting untuk Frontend

- Foto dikirim sebagai string `foto_url` (diunggah frontend, mis. ke Supabase Storage), bukan via file upload ke backend.
- CORS terbuka.
- Semua respons memakai format `{ success, data }` (atau `{ success: false, message }` saat error).
- `user_id` pada laporan selalu diambil dari token — client tidak bisa mengatasnamakan user lain.

### ⚠️ Status Integrasi Frontend ↔ Backend

Frontend (`frontend/src/lib/api.ts`) **belum mengirim token JWT**. Setelah backend auth aktif, tiga panggilan ini akan gagal dengan `401`:

- `registerPelapor()` — `POST /api/users` sekarang hanya untuk admin (pendaftaran warga yang benar lewat `POST /api/auth/register`).
- `findPelaporByEmail()` — `GET /api/users` sekarang hanya untuk admin.
- `createLaporan()` — `POST /api/laporan` sekarang butuh header `Authorization: Bearer <token>`.

Yang masih kurang di frontend: halaman login/register, penyimpanan token (mis. `localStorage`), dan pengiriman header `Authorization` di `api.ts`. Sampai itu dikerjakan, form `/lapor` tidak bisa membuat laporan ke backend yang sudah diproteksi.

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

> *Dokumen ini berbasis pada Product Requirements Document (PRD) v0.1 per tanggal 9 Oktober 2026 dan dapat berubah seiring pengembangan lebih lanjut. Diperbarui 26 Oktober 2026: mencakup frontend (Next.js + PWA), backend (Express + JWT), dan status integrasi keduanya.*
