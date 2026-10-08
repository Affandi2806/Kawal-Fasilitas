# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## KAWAL-FASILITAS

**STATUS: DRAFT SEMENTARA (v0.1)**

| | |
| --- | --- |
| **Nama Produk** | Kawal-Fasilitas |
| **Versi Dokumen** | v0.1 |
| **Disusun oleh** | Ahmad Affandi Dwi Andoko (Pengembang) |
| **Untuk** | Pemerintah Desa/Kelurahan (Klien) |
| **Tanggal** | 8 Oktober 2026 |
| **Dokumen Terkait** | Deskripsi Revisi Kebutuhan Kawal-Fasilitas |

---

# 1. Ringkasan Produk (Overview)

Sistem pengaduan dan perbaikan fasilitas publik di tingkat desa seringkali menghadapi tantangan dalam hal pelacakan, pelaporan manual, serta minimnya transparansi status penyelesaian kepada masyarakat. Kondisi ini membuat pelapor kesulitan mengetahui apakah aduan mereka telah ditindaklanjuti atau masih tertunda.

Kawal-Fasilitas dirancang sebagai platform berbasis Progressive Web App (PWA) dan cloud computing untuk menjembatani interaksi antara warga dan pemerintah desa. Platform ini mendigitalisasi siklus pelaporan mulai dari unggahan kerusakan, validasi perangkat desa, hingga konfirmasi perbaikan oleh tim eksekutor di lapangan, memastikan seluruh proses berjalan akuntabel dan dapat dipantau secara real-time.

# 2. Tujuan & Sasaran (Goals)

- Menyediakan saluran pelaporan kerusakan fasilitas umum yang mudah diakses warga melalui antarmuka web PWA tanpa perlu instalasi rumit.
- Memberikan transparansi progres perbaikan secara real-time kepada pelapor.
- Mengurangi kesenjangan komunikasi antara pemerintah desa/kelurahan dan warga.
- Meningkatkan efisiensi disposisi tugas dan akuntabilitas kerja dari Tim Lapangan.

# 3. Pengguna & Peran (Users & Roles)

- **Warga (Pelapor) :** Mengakses aplikasi untuk melaporkan fasilitas umum yang rusak dengan bukti foto dan lokasi, serta memantau progres laporannya.
- **Admin Kelurahan/Desa (Verifikator) :** Menerima laporan yang masuk, memeriksa kelayakan, memvalidasi (atau menolak), serta menugaskan perbaikan.
- **Tim Lapangan (Eksekutor) :** Menerima perintah perbaikan beserta lokasi, melakukan pekerjaan fisik di lapangan, dan memberikan bukti penyelesaian.

# 4. Ruang Lingkup (Scope)

## 4.1 Termasuk (MVP)

- Modul Pelaporan Warga (foto dan GPS otomatis).
- Modul Validasi Admin (pembaruan status & disposisi).
- Modul Pembaruan Tugas Lapangan (unggah foto hasil perbaikan).
- Sistem pemantauan status laporan real-time transparan.

## 4.2 Di Luar Lingkup Awal / Fase Lanjutan

Belum ada fitur yang ditunda secara spesifik pada tahap ini, seluruh alur kerja dasar masuk dalam rilis MVP.

# 5. Asumsi & Batasan (Assumptions & Constraints)

- **Teknologi :** Sistem dibangun dengan arsitektur web modern menggunakan Next.js dan Express.js, serta memanfaatkan Supabase sebagai solusi basis data/backend cloud.
- **Pendekatan Desain :** Mengutamakan *Mobile-First Design* mengingat warga dan tim lapangan mayoritas akan mengakses PWA via *smartphone*.
- **Otomasi Rilis :** Deployment menggunakan *pipeline* CI/CD via GitHub Actions untuk mempercepat pembaruan aplikasi.
- **Akurasi Lokasi :** Tingkat presisi titik koordinat (geotagging) bergantung pada kualitas sinyal dan modul GPS pada perangkat seluler masing-masing warga.

# 6. Kebutuhan Fungsional (Functional Requirements)

## 6.1 Warga (Pelapor) — Modul Lapor

| **ID** | **Kebutuhan Fungsional** | **Prioritas** |
| --- | --- | --- |
| **WRG-1** | Warga dapat mengunggah foto kerusakan fasilitas umum (jalan berlubang, lampu mati, dll). | **Wajib** |
| **WRG-2** | Sistem secara otomatis merekam titik koordinat lokasi (geotagging GPS) bersamaan dengan foto. | **Wajib** |
| **WRG-3** | Warga dapat memantau status laporan mereka secara real-time. | **Wajib** |

## 6.2 Admin Desa — Modul Verifikasi & Disposisi

| **ID** | **Kebutuhan Fungsional** | **Prioritas** |
| --- | --- | --- |
| **ADM-1** | Admin dapat melihat dan memvalidasi daftar laporan masuk dari warga. | **Wajib** |
| **ADM-2** | Admin dapat mengubah status laporan menjadi "Diproses" atau "Ditolak" (dengan input alasan penolakan secara transparan). | **Wajib** |
| **ADM-3** | Admin dapat mendisposisikan tugas perbaikan ke entitas Tim Lapangan. | **Wajib** |

## 6.3 Tim Lapangan — Modul Eksekusi

| **ID** | **Kebutuhan Fungsional** | **Prioritas** |
| --- | --- | --- |
| **TLP-1** | Tim Lapangan menerima rincian tugas perbaikan beserta titik koordinat lokasi. | **Wajib** |
| **TLP-2** | Tim Lapangan dapat mengunggah foto bukti hasil perbaikan (*after*). | **Wajib** |
| **TLP-3** | Sistem mengubah status laporan menjadi "Selesai" setelah foto bukti perbaikan diunggah. | **Wajib** |

# 7. Alur Pengguna Utama (Key User Flows)

## 7.1 Alur Pelaporan Warga (Happy Path)

1. Warga membuka PWA Kawal-Fasilitas dan mengakses menu buat laporan.
2. Warga mengambil/mengunggah foto kerusakan fasilitas publik.
3. Sistem secara otomatis menyematkan titik koordinat GPS dari perangkat.
4. Warga mengirimkan formulir pelaporan. Laporan tersimpan dengan status "Menunggu Validasi".

## 7.2 Alur Validasi dan Penugasan Admin

1. Admin meninjau dasbor dan membuka rincian laporan warga yang baru masuk.
2. Admin menyetujui laporan tersebut.
3. Admin memilih Tim Lapangan yang bertanggung jawab untuk perbaikan tersebut.
4. Laporan diperbarui menjadi berstatus "Diproses".
5. (*Alur Pengecualian*) Jika laporan dirasa tidak valid, Admin mengubah status menjadi "Ditolak" dan diwajibkan mengetik alasan penolakan.

## 7.3 Alur Penyelesaian oleh Tim Lapangan

1. Tim Lapangan membuka daftar tugas mereka di sistem dan melihat rincian lokasi.
2. Tim Lapangan melakukan perbaikan di lokasi sasaran.
3. Tim Lapangan membuka rincian tugas terkait dan mengunggah foto bukti perbaikan (*after*).
4. Status pelaporan pada sistem warga dan admin berubah menjadi "Selesai".

# 8. Model Data (High-Level)

| **Entitas** | **Field Utama** | **Keterangan** |
| --- | --- | --- |
| **Pengguna** | `user_id`, `nama`, `peran`, `no_hp` | Mencakup identitas warga, admin, dan tim lapangan. |
| **Laporan** | `laporan_id`, `pelapor_id`, `foto_kerusakan`, `lat`, `long`, `status`, `alasan_ditolak`, `tanggal_lapor` | Data aduan dari warga. |
| **Perbaikan** | `perbaikan_id`, `laporan_id`, `tim_lapangan_id`, `foto_bukti`, `tanggal_selesai` | Bukti kerja eksekutor. |

# 9. Kebutuhan Non-Fungsional (Non-Functional Requirements)

- **Responsivitas :** Antarmuka (UI) wajib beradaptasi dengan sempurna pada ukuran layar smartphone, mengingat PWA merupakan target platform utama.
- **Kinerja :** Pembaruan data dan status harus terefleksi pada pengguna tanpa memerlukan pembaruan halaman terus-menerus (real-time).

# 10. Integrasi Pihak Ketiga

| **Layanan** | **Fungsi** | **Catatan** |
| --- | --- | --- |
| **Layanan Peta (API)** | Menampilkan titik pin lokasi kerusakan berbasis koordinat pada peta dasbor. | Menggunakan Maps pihak ketiga yang umum. |
| **Cloud Storage** | Penyimpanan aset media berupa unggahan foto sebelum dan sesudah. | Terintegrasi dengan layanan backend yang dipilih. |

# 11. Fitur Usulan / Fase Lanjutan

- **Notifikasi Push (Push Notifications).** Warga akan menerima pop-up pemberitahuan di peramban seluler (jika diizinkan) setiap kali admin atau tim lapangan mengubah status laporan.

# 12. Pertanyaan Terbuka / TBD

- **Autentikasi Warga:** Apakah warga diwajibkan mendaftar akun menggunakan NIK/No. WhatsApp, atau bisa melapor secara anonim tanpa login?
- **Timeline Resolusi:** Apakah diperlukan pengaturan SLA (Service Level Agreement) sistem yang memberikan indikator peringatan kepada admin jika laporan mengendap dan belum ditindaklanjuti dalam durasi hari tertentu?

# 13. Glosarium

- **PWA (Progressive Web App) :** Aplikasi web yang memberikan pengalaman layaknya aplikasi natif *(mobile app)* yang dapat diakses langsung tanpa harus mengunduh dari toko aplikasi.
- **Geotagging :** Penambahan informasi metadata letak geografis berupa koordinat lintang dan bujur (GPS) ke dalam suatu foto atau data.

---

*Dokumen ini merupakan draft sementara dan dapat berubah seiring pembahasan lebih lanjut dengan klien.*