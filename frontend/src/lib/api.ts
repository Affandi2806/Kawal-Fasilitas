export async function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
}

export async function apiFetch(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("Authorization")) {
    const sesi = bacaSesi();
    if (sesi?.token) headers.set("Authorization", `Bearer ${sesi.token}`);
  }
  try {
    const res = await fetch(path, { ...init, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`[${res.status}] ${data.message || "Terjadi kesalahan"}`);
    }
    return { res, data };
  } catch (err) {
    throw new Error("Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.");
  }
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
  // Kolom respons /api/laporan/all; demo lama (riwayat-demo) tidak punya bidang ini.
  latitude?: number | null;
  longitude?: number | null;
  updated_at?: string;
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

// Mode pratinjau desain: /api/laporan/all, PUT status, POST disposisi dan
// /api/users semuanya butuh JWT admin yang belum ada di frontend, jadi
// dasbor admin memakai data contoh, bukan data nyata.
export const ADMIN_DEMO = process.env.NEXT_PUBLIC_ADMIN_DEMO === "1";

export interface AnggotaTim {
  id: string;
  nama: string;
  email: string;
}

// Kontrak: GET /api/laporan/all -> { success, data: Laporan[] } terbaru dulu.
export async function getLaporanAdmin(status?: string) {
  if (ADMIN_DEMO) {
    const { laporanAdminDemo } = await import("./admin-demo");
    return status
      ? laporanAdminDemo.filter((l) => l.status === status)
      : laporanAdminDemo;
  }
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const { data } = await apiFetch(
    `${await getApiUrl()}/api/laporan/all${qs}`
  );
  return data.data as Laporan[];
}

// Label "Diproses" disimpan backend sebagai diverifikasi; alasan_penolakan
// wajib saat "Ditolak" dan dibersihkan backend saat "Diproses".
export async function validasiLaporan(
  id: string,
  keputusan: "Diproses" | "Ditolak",
  alasan?: string
) {
  if (ADMIN_DEMO) {
    const { laporanAdminDemo } = await import("./admin-demo");
    const l = laporanAdminDemo.find((x) => x.id === id);
    if (!l) throw new Error("Laporan tidak ditemukan.");
    l.status = keputusan === "Diproses" ? "diverifikasi" : "ditolak";
    l.alasan_penolakan = keputusan === "Ditolak" ? alasan ?? null : null;
    l.updated_at = new Date().toISOString();
    return l;
  }
  const { data } = await apiFetch(
    `${await getApiUrl()}/api/laporan/${encodeURIComponent(id)}/status`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: keputusan,
        alasan_penolakan: keputusan === "Ditolak" ? alasan : undefined,
      }),
    }
  );
  return data;
}

// POST /api/laporan/:id/disposisi -> 201, laporan jadi dalam_perbaikan.
export async function disposisiLaporan(id: string, timLapanganId: string) {
  if (ADMIN_DEMO) {
    return { success: true };
  }
  const { data } = await apiFetch(
    `${await getApiUrl()}/api/laporan/${encodeURIComponent(id)}/disposisi`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tim_lapangan_id: timLapanganId }),
    }
  );
  return data;
}

// Kontrak: GET /api/users -> semua user (khusus admin); tim = role "tim_lapangan".
export async function getAnggotaTim(): Promise<AnggotaTim[]> {
  if (ADMIN_DEMO) {
    const { anggotaTimDemo } = await import("./admin-demo");
    return anggotaTimDemo;
  }
  const { data } = await apiFetch(`${await getApiUrl()}/api/users`);
  return (data.data as Array<{ id: unknown; nama: string; email: string; role: string }>)
    .filter((u) => u.role === "tim_lapangan")
    .map((u) => ({ id: String(u.id), nama: u.nama, email: u.email }));
}

export interface SesiPengguna {
  id: string;
  nama: string;
  email: string;
  role: "admin" | "tim_lapangan" | "warga";
  token: string;
}

// Mode pratinjau desain: login memakai akun demo lokal, bukan POST /api/auth/login.
export const LOGIN_DEMO = process.env.NEXT_PUBLIC_LOGIN_DEMO === "1";

// Kontrak: POST /api/auth/login -> { success, data: { user, token } };
// kredensial salah = 401 dan apiFetch melempar Error "[401] ...".
export async function loginPengguna(
  email: string,
  password: string
): Promise<SesiPengguna> {
  if (LOGIN_DEMO) {
    const { cariAkunDemo } = await import("./login-demo");
    const sesi = cariAkunDemo(email, password);
    if (!sesi) throw new Error("Email atau password salah");
    return sesi;
  }
  const { data } = await apiFetch(`${await getApiUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return { ...data.data.user, token: data.data.token } as SesiPengguna;
}

const SESI_KEY = "kawal-sesi";

export function simpanSesi(sesi: SesiPengguna) {
  localStorage.setItem(SESI_KEY, JSON.stringify(sesi));
}

export function bacaSesi(): SesiPengguna | null {
  if (typeof window === "undefined") return null;
  try {
    const json = localStorage.getItem(SESI_KEY);
    return json ? (JSON.parse(json) as SesiPengguna) : null;
  } catch {
    return null;
  }
}

export function hapusSesi() {
  localStorage.removeItem(SESI_KEY);
}

// "warga" dan role tak dikenal sama-sama jatuh ke /riwayat.
export function ruteUntukRole(role: string): string {
  if (role === "admin") return "/admin";
  if (role === "tim_lapangan") return "/tim-lapangan";
  return "/riwayat";
}

