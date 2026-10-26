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
- **Lapor Kerusakan:** Mengunggah foto kerusakan fasilitas umum (jalan berlubang, lampu mati, dll).
- **Geotagging Otomatis:** Sistem otomatis merekam titik koordinat lokasi (GPS) bersamaan dengan foto.
- **Lacak Laporan:** Memantau status laporan secara real-time.

### 2. Admin Kelurahan/Desa (Verifikator)
- **Validasi Laporan:** Melihat dan memvalidasi daftar laporan masuk dari warga.
- **Manajemen Status:** Mengubah status laporan menjadi "diverifikasi" atau "dalam_perbaikan", atau "ditolak" (dilengkapi alasan penolakan).
- **Disposisi Tugas:** Mendisposisikan tugas perbaikan ke entitas Tim Lapangan.

### 3. Tim Lapangan (Eksekutor)
- **Penerimaan Tugas:** Menerima rincian tugas perbaikan beserta titik koordinat lokasi.
- **Laporan Selesai:** Mengunggah foto bukti hasil perbaikan (after). Sistem otomatis mengubah status laporan menjadi "Selesai".

---

## 🔄 Alur Kerja Sistem (Workflow)

1. **Lapor:** Warga memotret kerusakan ➔ Sistem merekam GPS ➔ Laporan masuk (Status: *pending*).
2. **Validasi & Disposisi:** Admin meninjau laporan ➔ Menyetujui & Memilih Tim Lapangan (Status: *diverifikasi* / *dalam_perbaikan*).
   *(Catatan: Jika ditolak, Admin wajib memberikan alasan dan status menjadi ditolak).*
3. **Eksekusi:** Tim Lapangan memperbaiki fasilitas ➔ Mengunggah foto bukti perbaikan ➔ Laporan selesai (Status: *selesai*).

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

- **Frontend:** Next.js (Mobile-First Design, PWA)
- **Backend:** Express.js (Node.js) + JWT manual (jsonwebtoken, password di-hash dengan bcrypt)
- **Database / Cloud Backend:** Supabase (PostgreSQL, Service Role untuk akses server, Storage)
- **CI/CD:** GitHub Actions
- **Integrasi Pihak Ketiga:** Maps API (untuk visualisasi lokasi) & Cloud Storage (untuk aset foto)

---

## ⚙️ Spesifikasi Backend (Express.js + Supabase)

Bagian ini memuat dokumentasi khusus untuk Backend API aplikasi monitoring & pelaporan fasilitas.  
*Terkait Issue: [Affandi2806/Kawal-Fasilitas#6](https://github.com/Affandi2806/Kawal-Fasilitas/issues/6)*

> Detail lengkap backend (termasuk matriks akses per role) ada di `backend/README.md`.

### Arsitektur Direktori

```text
backend/
├── src/
│   ├── server.js                  # entry point
│   ├── app.js                     # express app (untuk test / reuse)
│   ├── config/
│   │   └── supabase.js            # Supabase client (service_role)
│   ├── routes/                    # definisi endpoint
│   │   ├── auth.routes.js         # POST /register, /login; GET /me
│   │   ├── users.routes.js
│   │   ├── laporan.routes.js
│   │   └── perbaikan.routes.js
│   ├── controllers/               # logika request/response + validasi
│   │   ├── auth.controller.js     # register (paksa warga) / login / me
│   │   ├── users.controller.js
│   │   ├── laporan.controller.js
│   │   └── perbaikan.controller.js
│   ├── models/                    # query ke Supabase per tabel
│   │   ├── users.model.js
│   │   ├── laporan.model.js
│   │   └── perbaikan.model.js
│   ├── middlewares/
│   │   ├── auth.js                # authenticate (Bearer JWT) + authorize(...role)
│   │   └── errorHandler.js
│   └── utils/
│       └── jwt.js                 # signToken / verifyToken
└── migrations/
    ├── 001_create_schema.sql      # skema users, laporan, perbaikan
    └── 002_align_roles.sql        # role -> warga | admin | tim_lapangan
```

### Setup & Instalasi

```bash
cd backend
npm install
cp .env.example .env
# isi SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, dan JWT_SECRET di file .env
# JWT_SECRET acak: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm run dev    # menjalankan server mode development (auto-reload)
npm start      # menjalankan server mode production
```

### Database & Relasi

Jalankan file migrasi **berurutan** di Supabase Dashboard → SQL Editor:

1. `migrations/001_create_schema.sql` — tabel `users`, `laporan`, dan `perbaikan` beserta index, trigger `updated_at`, dan pengaturan RLS (Row Level Security) yang memastikan akses hanya dapat dilakukan via *service_role key* milik server.
2. `migrations/002_align_roles.sql` — selaraskan role ke `warga | admin | tim_lapangan` (memetakan nilai lama `pelapor` → `warga` dan `teknisi` → `tim_lapangan`).

**Relasi Antar Tabel:**
- `users 1—N laporan` *(dihubungkan melalui `laporan.user_id`)*
- `laporan 1—N perbaikan` *(dihubungkan melalui `perbaikan.laporan_id`)*
- `users 1—N perbaikan` *(dihubungkan melalui `perbaikan.teknisi_id`)*

**Status Global:**
- **Status Laporan:** `pending | diverifikasi | dalam_perbaikan | selesai | ditolak`
- **Status Perbaikan:** `dijadwalkan | dikerjakan | selesai | dibatalkan`

### Autentikasi & Otorisasi

Autentikasi memakai JWT manual (jsonwebtoken), bukan Supabase Auth. Password di-hash dengan bcrypt. Setiap request terproteksi membawa token di header:

```
Authorization: <redacted>
```

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| **GET** | `/health` | Cek status server | Publik |
| **POST** | `/api/auth/register` | Daftar akun baru (selalu role `warga`) | Publik |
| **POST** | `/api/auth/login` | Login, balikan `{ user, token }` | Publik |
| **GET** | `/api/auth/me` | Profil user dari token | Token |
| **GET** | `/api/users` | List semua user | Admin |
| **GET** | `/api/users/:id` | Detail user | Admin |
| **POST** | `/api/users` | Buat akun `admin` / `tim_lapangan` | Admin |
| **PATCH**| `/api/users/:id` | Update user | Admin |
| **DELETE**| `/api/users/:id` | Hapus user | Admin |
| **GET** | `/api/laporan` | List laporan *(Filter: ?status=, ?user_id=)* | Token |
| **GET** | `/api/laporan/:id` | Detail laporan (+ data pelapor) | Token |
| **POST** | `/api/laporan` | Buat laporan baru (`user_id` dari token) | Token |
| **PATCH**| `/api/laporan/:id` | Update laporan / status | Admin, Tim Lapangan |
| **DELETE**| `/api/laporan/:id` | Hapus laporan | Admin |
| **GET** | `/api/perbaikan` | List perbaikan *(Filter: ?status=, ?laporan_id=, ?teknisi_id=)* | Token |
| **GET** | `/api/perbaikan/:id`| Detail perbaikan (+ laporan & teknisi) | Token |
| **POST** | `/api/perbaikan` | Disposisi tugas ke Tim Lapangan | Admin |
| **PATCH**| `/api/perbaikan/:id`| Update perbaikan / status | Admin, Tim Lapangan |
| **DELETE**| `/api/perbaikan/:id`| Hapus data perbaikan | Admin |

---

> *Dokumen ini berbasis pada Product Requirements Document (PRD) v0.1 per tanggal 9 Oktober 2026 dan dapat berubah seiring pengembangan lebih lanjut. Diperbarui 26 Oktober 2026: autentikasi JWT + role `warga | admin | tim_lapangan`.*
