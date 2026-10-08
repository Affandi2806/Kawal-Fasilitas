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

Sistem ini membagi akses menjadi tiga peran utama (Role: `admin | teknisi | pelapor`):

### 1. Warga (Pelapor)
- **Lapor Kerusakan:** Mengunggah foto kerusakan fasilitas umum (jalan berlubang, lampu mati, dll).
- **Geotagging Otomatis:** Sistem otomatis merekam titik koordinat lokasi (GPS) bersamaan dengan foto.
- **Lacak Laporan:** Memantau status laporan secara real-time.

### 2. Admin Kelurahan/Desa (Verifikator)
- **Validasi Laporan:** Melihat dan memvalidasi daftar laporan masuk dari warga.
- **Manajemen Status:** Mengubah status laporan menjadi "Diproses" atau "Ditolak" (dilengkapi alasan penolakan).
- **Disposisi Tugas:** Mendisposisikan tugas perbaikan ke entitas Tim Lapangan.

### 3. Tim Lapangan (Eksekutor / Teknisi)
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
- **Backend:** Express.js (Node.js)
- **Database / Cloud Backend:** Supabase (PostgreSQL, Service Role untuk akses Server, Auth, Storage)
- **CI/CD:** GitHub Actions
- **Integrasi Pihak Ketiga:** Maps API (untuk visualisasi lokasi) & Cloud Storage (untuk aset foto)

---

## ⚙️ Spesifikasi Backend (Express.js + Supabase)

Bagian ini memuat dokumentasi khusus untuk Backend API aplikasi monitoring & pelaporan fasilitas.  
*Terkait Issue: [Affandi2806/Kawal-Fasilitas#6](https://github.com/Affandi2806/Kawal-Fasilitas/issues/6)*

### Arsitektur Direktori

```text
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

### Setup & Instalasi

```bash
cd server
npm install
cp .env.example .env
# isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di file .env
npm run dev    # menjalankan server mode development (auto-reload)
npm start      # menjalankan server mode production
```

### Database & Relasi

Jalankan file `migrations/001_create_schema.sql` di Supabase Dashboard → SQL Editor.  
Skema ini akan membuat tabel `users`, `laporan`, dan `perbaikan` beserta index, trigger `updated_at`, dan pengaturan RLS (Row Level Security) yang memastikan akses hanya dapat dilakukan via *service_role key* milik server.

**Relasi Antar Tabel:**
- `users 1—N laporan` *(dihubungkan melalui `laporan.user_id`)*
- `laporan 1—N perbaikan` *(dihubungkan melalui `perbaikan.laporan_id`)*
- `users 1—N perbaikan` *(dihubungkan melalui `perbaikan.teknisi_id`)*

**Status Global:**
- **Status Laporan:** `pending | diverifikasi | dalam_perbaikan | selesai | ditolak`
- **Status Perbaikan:** `dijadwalkan | dikerjakan | selesai | dibatalkan`

### Endpoint API

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| **GET** | `/health` | Cek status server |
| **GET** | `/api/users` | List semua user |
| **GET** | `/api/users/:id` | Detail user |
| **POST** | `/api/users` | Registrasi user (hash bcrypt) |
| **PATCH**| `/api/users/:id` | Update user |
| **DELETE**| `/api/users/:id` | Hapus user |
| **GET** | `/api/laporan` | List laporan *(Filter: ?status=, ?user_id=)* |
| **GET** | `/api/laporan/:id` | Detail laporan (+ data pelapor) |
| **POST** | `/api/laporan` | Buat laporan baru |
| **PATCH**| `/api/laporan/:id` | Update laporan / status |
| **DELETE**| `/api/laporan/:id` | Hapus laporan |
| **GET** | `/api/perbaikan` | List perbaikan *(Filter: ?status=, ?laporan_id=, ?teknisi_id=)* |
| **GET** | `/api/perbaikan/:id`| Detail perbaikan (+ laporan & teknisi) |
| **POST** | `/api/perbaikan` | Catat perbaikan baru |
| **PATCH**| `/api/perbaikan/:id`| Update perbaikan / status |
| **DELETE**| `/api/perbaikan/:id`| Hapus data perbaikan |

---

## 🚀 Pengembangan Lanjutan (Roadmap)

- [ ] **Push Notifications:** Notifikasi real-time ke perangkat warga saat ada perubahan status laporan.
- [ ] **Sistem Autentikasi Fleksibel:** Penentuan antara login menggunakan NIK/WhatsApp atau pelaporan anonim.
- [ ] **SLA (Service Level Agreement):** Indikator peringatan kepada admin jika laporan mengendap dan belum ditindaklanjuti dalam batas waktu tertentu.

---

> *Dokumen ini berbasis pada Product Requirements Document (PRD) v0.1 per tanggal 9 Oktober 2026 dan dapat berubah seiring pengembangan lebih lanjut.*
