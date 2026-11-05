import type { Perbaikan } from "./api";

// Data contoh HANYA untuk pratinjau desain /tim-lapangan (NEXT_PUBLIC_TIM_LAPANGAN_DEMO=1).
// Endpoint asli butuh JWT yang belum ada di frontend, jadi mode ini menggantikannya.
// Bentuk item mengikuti kontrak backend persis, bukan data nyata.
const relatif = (hari: number) =>
  new Date(Date.now() + hari * 86400000).toISOString();

// laporan_id sengaja merujuk laporan di riwayat-demo agar data contoh saling nyambung.
export const TEKNISI_DEMO = {
  id: "teknisi-demo-1",
  nama: "Budi Santoso",
  email: "budi@kawal.desa.id",
};

export const tugasDemo: Perbaikan[] = [
  {
    id: "f4a8c2d9-7e31-4b06-a952-6c8d1f3b7425",
    laporan_id: "b8e2d4f6-1a53-4c07-9b6e-2f0a8c4d1937",
    teknisi_id: TEKNISI_DEMO.id,
    status: "dikerjakan",
    tanggal_mulai: relatif(-1),
    tanggal_selesai: null,
    biaya: null,
    catatan: "Prioritas: jalur antar-jemput sekolah",
    created_at: relatif(-3),
    updated_at: relatif(-1),
    laporan: {
      id: "b8e2d4f6-1a53-4c07-9b6e-2f0a8c4d1937",
      judul: "Jalan berlubang di depan gerbang SDN 3",
      lokasi: "Depan SDN 3, Dusun Kidul",
      status: "dalam_perbaikan",
    },
    teknisi: TEKNISI_DEMO,
  },
  {
    id: "a7d3e6b1-8f24-4c59-9b8a-3e1c7d5f2649",
    laporan_id: "a1f3c8d2-6b47-4e29-8d5a-3c9f1b7e6042",
    teknisi_id: TEKNISI_DEMO.id,
    status: "dijadwalkan",
    tanggal_mulai: relatif(1),
    tanggal_selesai: null,
    biaya: null,
    catatan: null,
    created_at: relatif(-2),
    updated_at: relatif(-2),
    laporan: {
      id: "a1f3c8d2-6b47-4e29-8d5a-3c9f1b7e6042",
      judul: "Lampu jalan padam sejak Sabtu malam",
      lokasi: "Gang Masjid RT 04, Dusun Krajan",
      status: "diverifikasi",
    },
    teknisi: TEKNISI_DEMO,
  },
  {
    id: "c2b9f4a7-5d18-4e36-8d7c-9f0a3b6e1824",
    laporan_id: "d9e5a1c3-2b46-4f87-9e2a-7c3d8f5b0461",
    teknisi_id: TEKNISI_DEMO.id,
    status: "selesai",
    tanggal_mulai: relatif(-3),
    tanggal_selesai: relatif(-2),
    biaya: null,
    catatan: "Sudah diganti pipa 2 meter",
    created_at: relatif(-5),
    updated_at: relatif(-2),
    laporan: {
      id: "d9e5a1c3-2b46-4f87-9e2a-7c3d8f5b0461",
      judul: "Pipa PDAM bocor di pertigaan pasar",
      lokasi: "Pertigaan Pasar, Dusun Krajan",
      status: "selesai",
    },
    teknisi: TEKNISI_DEMO,
  },
];
