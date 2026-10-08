# Kawal-Fasilitas 🏘️🛠️

Kawal-Fasilitas adalah platform berbasis Progressive Web App (PWA) dan cloud computing yang dirancang untuk menjembatani interaksi antara warga dan pemerintah desa/kelurahan. Aplikasi ini mendigitalisasi siklus pelaporan kerusakan fasilitas umum mulai dari unggahan kerusakan oleh warga, validasi oleh perangkat desa, hingga konfirmasi perbaikan oleh tim lapangan.

**Status Proyek:** Draft Sementara (v0.1)

**Dikembangkan oleh:**
1. Ahmad Affandi Dwi Andoko
2. Muhamad Ilham Fathony Sulton
3. Mochammad Rizky Hendriyan Syah

---

## 🎯 Tujuan Utama

* **Kemudahan Akses:** Menyediakan saluran pelaporan kerusakan fasilitas umum yang mudah diakses warga melalui PWA tanpa perlu instalasi rumit.
* **Transparansi:** Memberikan pemantauan progres perbaikan secara real-time kepada pelapor.
* **Efisiensi:** Meningkatkan efisiensi disposisi tugas dan akuntabilitas kerja dari Tim Lapangan.

---

## 👥 Pengguna & Fitur Utama

Sistem ini membagi akses menjadi tiga peran utama:

### 1. Warga (Pelapor)
* **Lapor Kerusakan:** Mengunggah foto kerusakan fasilitas umum (jalan berlubang, lampu mati, dll).
* **Geotagging Otomatis:** Sistem otomatis merekam titik koordinat lokasi (GPS) bersamaan dengan foto.
* **Lacak Laporan:** Memantau status laporan secara real-time.

### 2. Admin Kelurahan/Desa (Verifikator)
* **Validasi Laporan:** Melihat dan memvalidasi daftar laporan masuk dari warga.
* **Manajemen Status:** Mengubah status laporan menjadi "Diproses" atau "Ditolak" (dilengkapi alasan penolakan).
* **Disposisi Tugas:** Mendisposisikan tugas perbaikan ke entitas Tim Lapangan.

### 3. Tim Lapangan (Eksekutor)
* **Penerimaan Tugas:** Menerima rincian tugas perbaikan beserta titik koordinat lokasi.
* **Laporan Selesai:** Mengunggah foto bukti hasil perbaikan (after). Sistem akan otomatis mengubah status laporan menjadi "Selesai".

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

* **Frontend:** Next.js (Mobile-First Design, PWA)
* **Backend:** Express.js
* **Database / Cloud Backend:** Supabase
* **CI/CD:** GitHub Actions
* **Integrasi Pihak Ketiga:** Maps API (untuk visualisasi lokasi) & Cloud Storage (untuk aset foto)

---

## 🔄 Alur Kerja Sistem (Workflow)

1. **Lapor:** Warga memotret kerusakan ➔ Sistem merekam GPS ➔ Laporan masuk (Status: *Menunggu Validasi*).
2. **Validasi & Disposisi:** Admin meninjau laporan ➔ Menyetujui & Memilih Tim Lapangan (Status: *Diproses*).
   *(Catatan: Jika ditolak, Admin wajib memberikan alasan).*
3. **Eksekusi:** Tim Lapangan memperbaiki fasilitas ➔ Mengunggah foto bukti perbaikan ➔ Laporan selesai (Status: *Selesai*).

---

## 🚀 Pengembangan Lanjutan (Roadmap)

- [ ] **Push Notifications:** Notifikasi real-time ke perangkat warga saat ada perubahan status laporan.
- [ ] **Sistem Autentikasi Fleksibel:** Penentuan antara login menggunakan NIK/WhatsApp atau pelaporan anonim.
- [ ] **SLA (Service Level Agreement):** Indikator peringatan kepada admin jika laporan mengendap dan belum ditindaklanjuti dalam batas waktu tertentu.

---
> *Dokumen ini berbasis pada Product Requirements Document (PRD) v0.1 per tanggal 9 Oktober 2026 dan dapat berubah seiring pengembangan lebih lanjut.*
