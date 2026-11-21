# User Story Kawal-Fasilitas
Dokumen kebutuhan pengguna untuk aplikasi Kawal-Fasilitas, platform pelaporan kerusakan fasilitas publik oleh warga, dengan penanganan berjenjang oleh admin dan tim lapangan sampai perbaikan selesai.
Situs: www.kawalfasilitas.web.id | API: api.kawalfasilitas.web.id
Format tiap cerita: Sebagai [peran], saya ingin [kebutuhan], agar [manfaat]. Dilengkapi kriteria penerimaan sebagai syarat cerita dianggap selesai.

## Peran Pengguna
1. **Warga**: masyarakat yang melaporkan kerusakan fasilitas dan memantau tindak lanjutnya.
2. **Admin**: petugas pengelola yang memverifikasi laporan, menugaskan tim lapangan, dan mengelola pengguna.
3. **Tim Lapangan**: petugas yang menerima tugas perbaikan, mencatat pelaksanaan perbaikan, dan menyelesaikannya dengan bukti foto.

## Alur Status Laporan
Begini perjalanan laporan yang tampil di halaman riwayat warga, persis seperti label di aplikasinya:

**Menunggu Validasi, lalu Diproses, lalu Selesai.**

1. **Menunggu Validasi**: laporan baru terkirim dan menunggu diperiksa admin.
2. **Diproses**: admin sudah menerima laporan. Selama petugas lapangan mengerjakan perbaikan pun, tampilan di sisi warga tetap Diproses.
3. **Selesai**: perbaikan beres, dibuktikan dengan foto sesudah perbaikan.

Satu kemungkinan lain di tahap pemeriksaan: **Ditolak**, bila laporan tidak bisa diproses, misalnya foto tidak jelas atau bukan fasilitas publik. Alasan penolakannya selalu ditulis admin dan bisa dibaca warga di riwayat laporannya.

Nama status di sistem: Menunggu Validasi = pending, Diproses = diverifikasi lalu dalam_perbaikan, Selesai = selesai, Ditolak = ditolak.

## Tahap 1: Registrasi dan Masuk
Tahap awal sebelum pengguna dapat memakai layanan.

**US-1.1 Registrasi akun warga** (Must)
Sebagai warga, saya ingin mendaftar dengan nama, email, dan kata sandi, agar saya memiliki akun untuk membuat laporan.
Kriteria penerimaan:
- Formulir menerima nama, email, dan kata sandi; email yang sudah terdaftar ditolak dengan pesan jelas.
- Akun baru selalu berperan warga; peran tidak bisa dipilih atau diubah dari sisi pendaftar.
- Sesudah berhasil, pengguna diarahkan untuk masuk.

**US-1.2 Masuk dengan email dan kata sandi** (Must)
Sebagai pengguna terdaftar, saya ingin masuk dengan email dan kata sandi, agar saya dapat mengakses fitur sesuai peran saya.
Kriteria penerimaan:
- Kredensial benar menghasilkan sesi masuk (token JWT) dan pengguna diarahkan ke halaman sesuai perannya.
- Kredensial salah dibalas pesan kesalahan yang sama untuk email tidak dikenal maupun kata sandi salah.
- Sesi yang berakhir mengarahkan pengguna kembali ke halaman masuk saat membuka halaman terproteksi.

**US-1.3 Masuk dengan akun Google** (Should)
Sebagai warga, saya ingin masuk memakai akun Google, agar saya tidak perlu mengingat kata sandi tambahan.
Kriteria penerimaan:
- Tombol masuk Google membuka alur OAuth dan menghasilkan sesi yang setara dengan login biasa.
- Akun Google yang baru pertama kali masuk otomatis terdaftar sebagai warga.

**US-1.4 Melihat profil sendiri** (Should)
Sebagai pengguna yang sudah masuk, saya ingin melihat data profil saya, agar saya yakin masuk dengan akun yang benar.
Kriteria penerimaan:
- Halaman atau menu profil menampilkan nama, email, dan peran pengguna.
- Data yang tampil hanya milik pengguna yang sedang masuk.

## Tahap 2: Pembuatan Laporan oleh Warga
Inti layanan: warga menyampaikan kerusakan fasilitas.

**US-2.1 Membuat laporan kerusakan** (Must)
Sebagai warga, saya ingin membuat laporan berisi judul, deskripsi, lokasi, dan kategori kerusakan, agar kerusakan yang saya temukan tercatat dan dapat ditindaklanjuti.
Kriteria penerimaan:
- Formulir di halaman /lapor mewajibkan judul, deskripsi, lokasi, dan kategori.
- Laporan tersimpan dengan status awal pending dan tercatat sebagai milik pembuatnya.
- Pemilik laporan ditentukan dari sesi pengguna, bukan dari isian formulir.

**US-2.2 Melampirkan foto kerusakan** (Must)
Sebagai warga, saya ingin melampirkan foto kondisi fasilitas saat membuat laporan, agar admin dan tim lapangan dapat menilai kerusakan tanpa datang lebih dulu.
Kriteria penerimaan:
- Unggahan menerima format JPG, PNG, atau WebP; format lain ditolak dengan pesan jelas.
- Foto tersimpan dan dapat ditampilkan kembali di detail laporan.
- Laporan tanpa foto tidak dapat dikirim.

**US-2.3 Menerima nomor laporan** (Must)
Sebagai warga, saya ingin menerima nomor laporan sesudah laporan terkirim, agar saya punya tanda bukti dan acuan untuk memantau laporan itu.
Kriteria penerimaan:
- Kartu sukses menampilkan nomor laporan yang berasal dari data laporan yang benar-benar tersimpan di server.
- Nomor laporan yang sama muncul di daftar riwayat milik warga.

## Tahap 3: Verifikasi oleh Admin
Laporan masuk diteliti sebelum diteruskan ke lapangan.

**US-3.1 Melihat semua laporan masuk** (Must)
Sebagai admin, saya ingin melihat daftar seluruh laporan warga beserta statusnya, agar saya dapat memilah laporan yang menunggu verifikasi.
Kriteria penerimaan:
- Daftar hanya dapat diakses peran admin.
- Tiap baris menampilkan judul, pelapor, lokasi, kategori, status, dan waktu pembuatan.

**US-3.2 Melihat detail dan foto laporan** (Must)
Sebagai admin, saya ingin membuka detail laporan termasuk foto kerusakannya, agar saya dapat menilai kelayakan laporan.
Kriteria penerimaan:
- Detail menampilkan seluruh isian laporan, foto, dan identitas pelapor.
- Laporan yang tidak ada dibalas dengan keterangan tidak ditemukan.

**US-3.3 Memverifikasi laporan** (Must)
Sebagai admin, saya ingin memproses laporan yang layak dengan memilih status Diproses, agar laporan dapat diteruskan ke tahap penugasan.
Kriteria penerimaan:
- Perubahan status hanya dapat dilakukan admin, dan pilihan status untuk admin hanya Diproses atau Ditolak; nilai lain ditolak sistem.
- Status Diproses tersimpan di sistem sebagai diverifikasi.

**US-3.4 Menolak laporan dengan alasan** (Must)
Sebagai admin, saya ingin menolak laporan yang tidak layak dengan menyertakan alasan penolakan, agar warga memahami sebab laporannya tidak diproses.
Kriteria penerimaan:
- Penolakan tanpa alasan ditolak sistem; alasan wajib terisi.
- Status laporan menjadi ditolak dan alasannya terlihat oleh pelapor di riwayatnya.

## Tahap 4: Disposisi dan Penugasan
Laporan terverifikasi dibagikan menjadi pekerjaan lapangan.

**US-4.1 Mendisposisikan laporan ke tim lapangan** (Must)
Sebagai admin, saya ingin menugaskan laporan yang sudah diverifikasi kepada seorang anggota tim lapangan, agar perbaikan memiliki penanggung jawab yang jelas.
Kriteria penerimaan:
- Disposisi hanya dapat dilakukan admin dan hanya untuk laporan berstatus diverifikasi; laporan yang masih pending ditolak untuk didisposisi.
- Anggota tim dipilih dari daftar akun berperan tim_lapangan.
- Sesudah disposisi, terbentuk satu tugas untuk anggota tim tersebut dengan status dijadwalkan, dan status laporan menjadi dalam_perbaikan.

**US-4.2 Mengawasi laporan yang sudah didisposisikan** (Should)
Sebagai admin, saya ingin mengetahui laporan mana saja yang sudah didisposisikan dan sedang dikerjakan tim, agar saya dapat mengawasi tindak lanjutnya.
Kriteria penerimaan:
- Hasil disposisi terkonfirmasi lewat pesan berhasil di halaman admin.
- Laporan yang sudah didisposisikan tampil berstatus Dalam Perbaikan di daftar laporan admin.

## Tahap 5: Pelaksanaan Perbaikan oleh Tim Lapangan
Tim bekerja di lapangan dan mencatat prosesnya.

**US-5.1 Melihat daftar tugas saya** (Must)
Sebagai anggota tim lapangan, saya ingin melihat daftar tugas yang ditugaskan kepada saya di halaman /tim-lapangan, agar saya tahu pekerjaan apa yang harus saya kerjakan.
Kriteria penerimaan:
- Daftar hanya berisi tugas milik anggota tim yang sedang masuk.
- Tiap tugas menampilkan judul laporan, lokasi, deskripsi kerusakan, dan foto sebelum perbaikan.

**US-5.2 Melihat detail tugas dan laporan terkait** (Must)
Sebagai anggota tim lapangan, saya ingin membuka detail tugas beserta laporan asalnya, agar saya membawa informasi yang cukup ke lokasi.
Kriteria penerimaan:
- Detail menampilkan data laporan terkait dan data perbaikan yang sudah tercatat.
- Kartu perbaikan menampilkan tanggal mulai bila tanggal itu sudah terisi; bila belum ada, bagian tanggal tidak ditampilkan.

**US-5.3 Mencatat data perbaikan** (Should)
Sebagai anggota tim lapangan, saya ingin mencatat data pelaksanaan perbaikan seperti tanggal mulai, biaya, teknisi yang mengerjakan, dan catatan, agar pelaksanaan terdokumentasi dan dapat dipertanggungjawabkan.
Kriteria penerimaan:
- Data perbaikan tersimpan pada tugas atau laporan yang sedang dikerjakan.
- Field yang bersifat kewenangan admin, seperti penetapan biaya akhir dan pemindahan teknisi, tidak berubah dari sisi tim tanpa hak (lihat Catatan Keamanan).

## Tahap 6: Penyelesaian Tugas dan Laporan
Pekerjaan ditutup dengan bukti, dan status laporan bergerak otomatis.

**US-6.1 Menyelesaikan tugas dengan foto sesudah perbaikan** (Must)
Sebagai anggota tim lapangan, saya ingin menandai tugas saya selesai dengan mengunggah foto kondisi sesudah perbaikan dan catatan penyelesaian bila perlu, agar ada bukti bahwa fasilitas sudah diperbaiki.
Kriteria penerimaan:
- Penyelesaian tugas mewajibkan foto sesudah (foto_after) berformat gambar; tanpa foto, pengiriman terhalang.
- Catatan penyelesaian bersifat opsional.
- Sesudah terkirim, status tugas menjadi selesai dan kartu tugas diperbarui memakai data terbaru dari server.
- Penyelesaian yang sudah terkirim masih dapat diperbarui oleh tim yang sama, misalnya mengganti foto atau catatan.

**US-6.2 Laporan otomatis berstatus Selesai** (Must)
Sebagai warga, saya ingin status laporan saya berubah menjadi Selesai secara otomatis ketika tugas perbaikannya selesai, agar saya tidak perlu bertanya manual soal tindak lanjut.
Kriteria penerimaan:
- Ketika seluruh tugas yang terhubung ke laporan selesai, status laporan menjadi Selesai.
- Selama masih ada tugas yang belum selesai, status laporan tetap dalam_perbaikan.

## Tahap 7: Pemantauan oleh Warga
Warga mengikuti perjalanan laporannya.

**US-7.1 Melihat riwayat laporan saya** (Must)
Sebagai warga, saya ingin melihat daftar semua laporan yang pernah saya buat di halaman /riwayat, agar saya dapat memantau semuanya di satu tempat.
Kriteria penerimaan:
- Daftar hanya berisi laporan milik warga yang sedang masuk.
- Tiap laporan menampilkan judul, lokasi, waktu pembuatan, dan status terkininya.

**US-7.2 Memantau perubahan status secara langsung** (Must)
Sebagai warga, saya ingin status laporan saya tampil mengikuti perubahan terbaru (pending, diverifikasi, dalam_perbaikan, Selesai, atau ditolak), agar saya tahu sejauh mana laporan saya diproses tanpa bertanya ke petugas.
Kriteria penerimaan:
- Status yang tampil selalu sama dengan status terbaru di server.
- Laporan yang ditolak menampilkan alasan penolakannya.

**US-7.3 Melihat detail laporan saya** (Should)
Sebagai warga, saya ingin membuka detail laporan saya beserta foto yang saya kirim, agar saya dapat memastikan data laporan saya benar.
Kriteria penerimaan:
- Detail menampilkan seluruh data laporan beserta foto awal yang dikirim warga. Foto sesudah perbaikan saat ini tercatat di sisi petugas pada data perbaikan dan belum ditampilkan ke warga.
- Warga tidak dapat membuka detail laporan milik warga lain (lihat Catatan Keamanan).

## Tahap 8: Administrasi Sistem
Pengelolaan di luar alur laporan.

**US-8.1 Mengelola akun pengguna** (Must)
Sebagai admin, saya ingin membuat, mengubah, dan menghapus akun pengguna, agar komposisi warga, admin, dan tim lapangan terjaga.
Kriteria penerimaan:
- Seluruh pengelolaan pengguna hanya dapat diakses admin.
- Admin dapat menaikkan peran akun terdaftar menjadi tim_lapangan atau admin.
- Catatan keadaan saat ini: pengelolaan ini tersedia lewat API khusus admin; halaman khusus kelola pengguna di frontend belum ada, dan penaikan peran di produksi selama ini dilakukan lewat pengelolaan data backend.

**US-8.2 Menghapus laporan** (Should)
Sebagai admin, saya ingin menghapus laporan yang tidak sah atau duplikat, agar data laporan tetap bersih.
Kriteria penerimaan:
- Penghapusan hanya dapat dilakukan admin dan laporan hilang dari semua daftar.

**US-8.3 Mengakses aplikasi sebagai PWA** (Should)
Sebagai pengguna, saya ingin aplikasi dapat dipasang di layar utama ponsel dan dibuka seperti aplikasi biasa, agar pelaporan dari lapangan terasa cepat.
Kriteria penerimaan:
- Situs memenuhi syarat pemasangan PWA dan tampil baik di layar ponsel maupun desktop.

## Catatan Keamanan (hasil scan Strix 20 dan 21 November 2026)
Empat temuan MEDIUM dari pengujian keamanan perlu masuk sebagai pekerjaan perbaikan backend, karena berkaitan langsung dengan cerita di atas:
1. US-7.3 belum terpenuhi: detail laporan warga lain saat ini bisa dibaca lewat GET /api/laporan/:id (nama dan email pelapor ikut tampil). Perlu pemeriksaan kepemilikan untuk peran warga.
2. US-6.2 dapat dilanggar: tim dapat mengubah status laporan menjadi selesai lewat PATCH laporan tanpa menyelesaikan tugas. Transisi ke Selesai harus hanya lewat US-6.1.
3. US-5.3 perlu pembatasan field: tim saat ini dapat mengubah biaya dan teknisi_id pada data perbaikan serta menandai perbaikan selesai di luar alur tugas.
4. Daftar dan detail perbaikan (GET /api/perbaikan) saat ini terbuka untuk semua pengguna yang masuk, termasuk data kontak teknisi. Perlu pembatasan cakupan per peran dan penugasan.
Ditambah catatan tingkat rendah: endpoint login dan register belum memiliki rate limit.

## Ringkasan Prioritas
- Must: US-1.1, US-1.2, US-2.1, US-2.2, US-2.3, US-3.1, US-3.2, US-3.3, US-3.4, US-4.1, US-5.1, US-5.2, US-6.1, US-6.2, US-7.1, US-7.2, US-8.1
- Should: US-1.3, US-1.4, US-4.2, US-5.3, US-7.3, US-8.2, US-8.3
- Could: belum ada; usulan lanjutan yang wajar adalah notifikasi perubahan status ke warga dan ekspor rekap laporan untuk admin.
