# Kawal-Fasilitas

**Sistem Pengaduan dan Pelacakan Perbaikan Fasilitas Umum Desa Berbasis *Cloud Computing* dengan Transparansi Status *Real-Time***

## 📌 Deskripsi Singkat
**Kawal-Fasilitas** adalah platform berbasis *Progressive Web App* (PWA) dan *cloud computing* yang menjembatani warga dan pemerintah desa/kelurahan dalam melaporkan, memvalidasi, serta memantau progres perbaikan fasilitas umum secara transparan, akuntabel, dan *real-time* dari tahap pelaporan hingga penyelesaian.

---

## 🔄 Alur Kerja & Fitur MVP

1. **Warga (Pelapor):**
   - Mengunggah foto kerusakan fasilitas umum (jalan berlubang, lampu jalan mati, dll.) beserta titik koordinat otomatis (*geotagging* GPS).
   - Memantau status laporan secara *real-time*.
2. **Admin Kelurahan/Desa (Verifikator):**
   - Memvalidasi laporan yang masuk.
   - Mengubah status laporan menjadi **"Diproses"** (atau **"Ditolak"** dengan alasan transparan).
   - Mendisposisikan tugas perbaikan ke Tim Lapangan.
3. **Tim Lapangan (Eksekutor):**
   - Menerima rincian lokasi tugas perbaikan.
   - Mengunggah foto bukti hasil perbaikan (*after*) untuk mengubah status laporan menjadi **"Selesai"**.

---

## 🛠️ Arsitektur & Tech Stack (Zero-Cost Cloud)

| Komponen | Teknologi | Layanan Cloud (Hosting) | Kegunaan |
| :--- | :--- | :--- | :--- |
| **Frontend** | React.js / Next.js (PWA) | Vercel / Netlify | Form pengaduan warga berbasis PWA & dasbor disposisi tugas |
| **Backend** | Node.js & Express.js | Render | REST API & manajemen alur status (*status workflow*) laporan |
| **Database & Storage** | Supabase (PostgreSQL) | Supabase Cloud | Penyimpanan foto bukti, titik geolokasi, dan log riwayat penanganan |
| **CI/CD** | GitHub Actions | GitHub | Otomasi pengujian (*linting/testing*) dan *deployment* |

---
