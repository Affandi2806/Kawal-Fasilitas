export async function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
}

export async function registerPelapor(nama: string, email: string) {
  const { data } = await apiFetch(`${await getApiUrl()}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama, email, password: Math.random().toString(36).slice(-8) }),
  });
  return data;
}

async function apiFetch(path: string, init?: RequestInit) {
  try {
    const res = await fetch(path, init);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`[${res.status}] ${data.message || "Terjadi kesalahan"}`);
    }
    return { res, data };
  } catch (err) {
    throw new Error("Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.");
  }
}

export async function findPelaporByEmail(email: string) {
  const { data } = await apiFetch(`${await getApiUrl()}/api/users`);
  const user = data.data.find((u: any) => u.email === email);
  if (!user) throw new Error("User not found");
  return user;
}

export async function createLaporan(payload: any) {
  const { data } = await apiFetch(`${await getApiUrl()}/api/laporan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data;
}

export type StatusLaporan =
  | "pending"
  | "diverifikasi"
  | "dalam_perbaikan"
  | "selesai"
  | "ditolak";

export interface Laporan {
  id: string;
  user_id: string;
  judul: string;
  deskripsi: string;
  lokasi: string;
  kategori: string;
  foto_url: string | null;
  status: StatusLaporan;
  alasan_penolakan: string | null;
  created_at: string;
}

// Mode pratinjau desain: GET /api/laporan/warga/:id butuh JWT yang belum ada
// di frontend, jadi getRiwayat mengembalikan data contoh, bukan data nyata.
export const RIWAYAT_DEMO = process.env.NEXT_PUBLIC_RIWAYAT_DEMO === "1";

// Kontrak respons: { success: true, data: Laporan[] }, terbaru dulu.
// Jalur demo memakai dynamic import agar data contoh berjarak dari bundle halaman.
// ponytail: bila env tak diset, webpack tetap memancangkan ~2 kB chunk demo yang
// tidak pernah dimuat; habis bila next.config mendefinisikan fallback env eksplisit.
export async function getRiwayat(wargaId: string) {
  if (RIWAYAT_DEMO) {
    const { riwayatDemo } = await import("./riwayat-demo");
    return riwayatDemo;
  }
  const { data } = await apiFetch(
    `${await getApiUrl()}/api/laporan/warga/${wargaId}`
  );
  return data.data as Laporan[];
}

export function loadPelapor() {
  const json = localStorage.getItem("kf_pelapor");
  return json ? JSON.parse(json) : null;
}

export function savePelapor(pelapor: any) {
  localStorage.setItem("kf_pelapor", JSON.stringify(pelapor));
}

export type StatusPerbaikan =
  | "dijadwalkan"
  | "dikerjakan"
  | "selesai"
  | "dibatalkan";

// Kontrak bentuk Perbaikan dari GET /api/perbaikan (butuh JWT, lihat TIM_LAPANGAN_DEMO).
export interface Perbaikan {
  id: string;
  laporan_id: string;
  teknisi_id: string;
  status: StatusPerbaikan;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  biaya: number | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  laporan: { id: string; judul: string; lokasi: string; status: StatusLaporan } | null;
  teknisi: { id: string; nama: string; email: string } | null;
}

// Mode pratinjau desain: /api/perbaikan butuh JWT yang belum ada di frontend,
// jadi tugas lapangan memakai data contoh, bukan data nyata.
export const TIM_LAPANGAN_DEMO =
  process.env.NEXT_PUBLIC_TIM_LAPANGAN_DEMO === "1";

// Kontrak respons: { success: true, data: Perbaikan[] }, terbaru dulu.
export async function getTugasLapangan(teknisiId: string) {
  if (TIM_LAPANGAN_DEMO) {
    const { tugasDemo } = await import("./tugas-demo");
    return tugasDemo;
  }
  const { data } = await apiFetch(
    `${await getApiUrl()}/api/perbaikan?teknisi_id=${encodeURIComponent(teknisiId)}`
  );
  // "dibatalkan" bukan tugas teknisi, saring keluar.
  return (data.data as Perbaikan[]).filter((p) => p.status !== "dibatalkan");
}

// Backend TIDAK punya kolom/endpoint foto bukti perbaikan. Foto bukti hanya
// data URL sisi klien untuk pratinjau (pola sama seperti foto di /lapor)
// dan sengaja tidak pernah dikirim ke API ini.
export async function selesaikanPerbaikan(id: string, catatan?: string) {
  if (TIM_LAPANGAN_DEMO) {
    return { success: true };
  }
  const { data } = await apiFetch(
    `${await getApiUrl()}/api/perbaikan/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "selesai",
        tanggal_selesai: new Date().toISOString(),
        catatan: catatan ?? null,
      }),
    }
  );
  return data;
}

