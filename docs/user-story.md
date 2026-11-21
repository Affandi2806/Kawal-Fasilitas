# User Story — Kawal-Fasilitas

Format: Sebagai [peran], saya ingin [fitur], agar [manfaat].
Kriteria: kondisi yang harus terpenuhi supaya story dianggap selesai.

## Warga

**US-01 — Lapor kerusakan**
Sebagai warga, saya ingin melaporkan kerusakan fasilitas dengan foto dan lokasi, agar laporan saya tercatat.
- Kriteria: foto wajib, lokasi GPS tersimpan, laporan muncul di Riwayat dengan status Terkirim.

**US-02 — Pantau status laporan**
Sebagai warga, saya ingin melihat status laporan saya, agar saya tahu sudah divalidasi, dikerjakan, atau selesai.
- Kriteria: status berubah real-time di /riwayat, ada riwayat perubahan status.

**US-03 — Login Google**
Sebagai warga, saya ingin login dengan Google, agar saya tidak perlu membuat password baru.
- Kriteria: klik Lanjutkan dengan Google, berhasil masuk, bisa buka /lapor.

## Admin

**US-04 — Validasi laporan**
Sebagai admin, saya ingin memvalidasi laporan masuk, agar hanya laporan valid yang diteruskan.
- Kriteria: admin bisa lihat detail laporan, ubah status jadi Divalidasi atau Ditolak dengan alasan.

**US-05 — Disposisi ke tim lapangan**
Sebagai admin, saya ingin mendisposisikan laporan ke tim lapangan, agar perbaikan segera dikerjakan.
- Kriteria: admin pilih tim lapangan, laporan muncul di halaman tim tersebut.

**US-06 — Lihat semua laporan**
Sebagai admin, saya ingin melihat semua laporan, agar saya bisa memantau keseluruhan.
- Kriteria: /admin menampilkan daftar laporan, bisa filter berdasarkan status.

## Tim Lapangan

**US-07 — Terima tugas perbaikan**
Sebagai tim lapangan, saya ingin melihat tugas yang didisposisikan ke saya, agar saya tahu apa yang harus diperbaiki.
- Kriteria: tugas muncul di /tim-lapangan dengan detail lokasi dan foto awal.

**US-08 — Update status dan foto after**
Sebagai tim lapangan, saya ingin mengunggah foto setelah perbaikan dan mengubah status jadi Selesai, agar warga tahu fasilitas sudah diperbaiki.
- Kriteria: foto after tersimpan, status berubah jadi Selesai.
