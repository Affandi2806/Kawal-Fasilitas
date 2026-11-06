import type { AnggotaTim, Laporan } from "./api";

// Data contoh HANYA untuk pratinjau desain /admin (NEXT_PUBLIC_ADMIN_DEMO=1).
// Mode asli butuh JWT admin yang belum ada di frontend, jadi mode ini menggantikannya.
// Bentuk item mengikuti kontrak backend persis, bukan data nyata.
const lalu = (hari: number) => new Date(Date.now() - hari * 86400000).toISOString();

const WARGA_CONTOH = "9c4f2d8a-1b36-4e57-8a92-6d0c5f3b7e14";

export const anggotaTimDemo: AnggotaTim[] = [
  { id: "teknisi-demo-1", nama: "Budi Santoso", email: "budi@kawal.desa.id" },
  { id: "teknisi-demo-2", nama: "Sari Wulandari", email: "sari@kawal.desa.id" },
  { id: "teknisi-demo-3", nama: "Andi Pratama", email: "andi@kawal.desa.id" },
];

// Urut terbaru dulu sesuai kontrak GET /api/laporan/all.
export const laporanAdminDemo: Laporan[] = [
  {
    id: "laporan-demo-1",
    user_id: WARGA_CONTOH,
    judul: "Sampah menumpuk di TPS liar dekat sungai",
    deskripsi:
      "Sampah curian terus didumpang di tepi bantaran sungai meski sudah ada larangan. Bongkahan plastik mulai terbawa air saat hujan.",
    lokasi: "Bantaran Sungai RT 04",
    kategori: "Kebersihan",
    foto_url: null,
    status: "pending",
    alasan_penolakan: null,
    latitude: -7.8166,
    longitude: 112.0118,
    created_at: lalu(0.2),
    updated_at: lalu(0.2),
  },
  {
    id: "laporan-demo-2",
    user_id: WARGA_CONTOH,
    judul: "Jembatan kayu rapuh di Dusun Krajan",
    deskripsi:
      "Papan jembatan penghubung dusun sudah lapuk dan bergoyang saat dilewati. Anak-anak sekolah memakainya setiap pagi.",
    lokasi: "Dusun Krajan RT 02",
    kategori: "Infrastruktur",
    foto_url: null,
    status: "pending",
    alasan_penolakan: null,
    latitude: null,
    longitude: null,
    created_at: lalu(1),
    updated_at: lalu(1),
  },
  {
    id: "laporan-demo-3",
    user_id: WARGA_CONTOH,
    judul: "Lampu jalan padam sejak Sabtu malam",
    deskripsi:
      "Lampu penerangan jalan di depan rumah Bu Karsi padam total sejak Sabtu malam. Lingkungan jadi gelap dan rawan.",
    lokasi: "Jl. Mawar RT 05",
    kategori: "Penerangan",
    foto_url: null,
    status: "diverifikasi",
    alasan_penolakan: null,
    latitude: -7.8194,
    longitude: 112.0142,
    created_at: lalu(2),
    updated_at: lalu(1.5),
  },
  {
    id: "laporan-demo-4",
    user_id: WARGA_CONTOH,
    judul: "Jalan berlubang di depan gerbang SDN 3",
    deskripsi:
      "Lubang selebar kurang lebih 60 cm tepat di jalur kendaraan masuk SDN 3. Mobil antar-jemput terpaksa memutar lewat gang sempit.",
    lokasi: "Jl. Pendidikan No. 3",
    kategori: "Infrastruktur",
    foto_url: null,
    status: "diverifikasi",
    alasan_penolakan: null,
    latitude: null,
    longitude: null,
    created_at: lalu(3.5),
    updated_at: lalu(3),
  },
  {
    id: "laporan-demo-5",
    user_id: WARGA_CONTOH,
    judul: "Pipa PDAM bocor di pertigaan pasar",
    deskripsi:
      "Pipa PDAM di pertigaan pasar bocor sehingga air terus memancar dan menggenangi jalan. Bocoran bertambah deras saat tekanan naik pagi hari.",
    lokasi: "Pertigaan Pasar Desa",
    kategori: "Air Bersih",
    foto_url: null,
    status: "dalam_perbaikan",
    alasan_penolakan: null,
    latitude: -7.821,
    longitude: 112.0175,
    created_at: lalu(6),
    updated_at: lalu(4),
  },
];
