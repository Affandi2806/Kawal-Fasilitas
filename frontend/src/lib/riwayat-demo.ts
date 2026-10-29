import type { Laporan } from "./api";

// Data contoh HANYA untuk pratinjau desain /riwayat (NEXT_PUBLIC_RIWAYAT_DEMO=1).
// Endpoint asli butuh JWT yang belum ada di frontend, jadi mode ini menggantikannya.
// Bentuk item mengikuti kontrak backend persis, bukan data nyata.
const lalu = (hari: number) => new Date(Date.now() - hari * 86400000).toISOString();

const WARGA_CONTOH = "7d1e5b2a-4c3f-49b8-9a1d-0e6f8c2b5a71";

export const riwayatDemo: Laporan[] = [
  {
    id: "a1f3c8d2-6b47-4e29-8d5a-3c9f1b7e6042",
    user_id: WARGA_CONTOH,
    judul: "Lampu jalan padam sejak Sabtu malam",
    deskripsi:
      "Lampu penerangan jalan di depan warung Bu Yati padam total sejak Sabtu malam. Gang jadi gelap dan licin, beberapa warga tersandung lubang yang tidak terlihat.",
    lokasi: "Gang Masjid RT 04, Dusun Krajan (-6.551283, 106.854302)",
    kategori: "Lampu Jalan",
    foto_url: null,
    status: "pending",
    alasan_penolakan: null,
    created_at: lalu(0.1),
  },
  {
    id: "b8e2d4f6-1a53-4c07-9b6e-2f0a8c4d1937",
    user_id: WARGA_CONTOH,
    judul: "Jalan berlubang di depan gerbang SDN 3",
    deskripsi:
      "Lubang selebar kurang lebih 60 cm tepat di jalur kendaraan masuk SDN 3. Mobil antar-jemuk terpaksa memutar lewat gang sempit.",
    lokasi: "Depan SDN 3, Dusun Kidul (-6.553914, 106.858776)",
    kategori: "Jalan Rusak",
    foto_url: null,
    status: "diverifikasi",
    alasan_penolakan: null,
    created_at: lalu(1.2),
  },
  {
    id: "c5a9b1e3-77d4-4f68-a2c8-1d4e9f0b2856",
    user_id: WARGA_CONTOH,
    judul: "Air selokan meluap ke jalan kampung",
    deskripsi:
      "Selokan di sisi jalan kampung tersumbat sehingga air meluap sampai ke bibir jalan. Bau menyengat dan air masuk halaman rumah warga.",
    lokasi: "Samping Balai Desa, Dusun Wetan",
    kategori: "Drainase & Selokan",
    foto_url: null,
    status: "ditolak",
    alasan_penolakan:
      "Foto yang dikirim tidak memperlihatkan kerusakan, dan titik lokasi terbaca di luar batas wilayah desa. Silakan ajukan ulang dengan foto terbaru yang diambil dari titik lokasi sebenarnya.",
    created_at: lalu(3.4),
  },
  {
    id: "d2f7a4c9-5e18-4b3d-8f61-9c0e2a7b4318",
    user_id: WARGA_CONTOH,
    judul: "Tumpukan sampah menutup saluran air pasar",
    deskripsi:
      "Sampah menumpuk di belakang pasar desa hingga menutup saluran air. Saat hujan deras, air menggenangi jalan kios sepanjang lima meter.",
    lokasi: "Belakang Pasar Desa, Dusun Krajan (-6.556010, 106.851443)",
    kategori: "Sampah",
    foto_url: null,
    status: "dalam_perbaikan",
    alasan_penolakan: null,
    created_at: lalu(6),
  },
  {
    id: "e9c1b6d8-3a24-4d57-91c3-5b8f0d2e6749",
    user_id: WARGA_CONTOH,
    judul: "Papan jembatan pekarangan rusak membahayakan",
    deskripsi:
      "Dua papan jembatan penghubung dusun sudah lapuk, salah satu bagiannya tembus. Anak-anak sekolah rutin melewatinya setiap pagi.",
    lokasi: "Jembatan Dusun Sukamaju, depan rumah Pak Sarno",
    kategori: "Jembatan",
    foto_url: null,
    status: "selesai",
    alasan_penolakan: null,
    created_at: lalu(9),
  },
];
