export async function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
}

const PESAN_TAK_TERHUBUNG =
  "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.";

export async function apiFetch(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("Authorization")) {
    const sesi = bacaSesi();
    if (sesi?.token) headers.set("Authorization", `Bearer ${sesi.token}`);
  }
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch {
    // Hanya kegagalan jaringan; respons HTTP gagal ditangani di bawah.
    throw new Error(PESAN_TAK_TERHUBUNG);
  }
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // Respons bukan JSON juga dihitung kegagalan jaringan.
  }
  // Sesi tak valid: buang sesi lalu paksa login ulang, kecuali ini
  // percobaan login sendiri (kredensial salah ditangani halaman login).
  if (res.status === 401 && !path.includes("/api/auth/login") && !path.includes("/api/auth/google")) {
    hapusSesi();
    if (window.location.pathname !== "/login") window.location.href = "/login";
  }
  if (!res.ok) {
    throw new Error(
      data
        ? `[${res.status}] ${data.message || "Terjadi kesalahan"}`
        : PESAN_TAK_TERHUBUNG
    );
  }
  if (!data) throw new Error(PESAN_TAK_TERHUBUNG);
  return { res, data };
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
  // Kolom respons /api/laporan/all, opsional (tidak ada di respons warga lama).
  latitude?: number | null;
  longitude?: number | null;
  updated_at?: string;
}

// Kontrak respons: { success: true, data: Laporan[] }, terbaru dulu.
export async function getRiwayat(wargaId: string) {
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

// Kontrak bentuk Perbaikan dari GET /api/perbaikan.
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

// Kontrak respons: { success: true, data: Perbaikan[] }, terbaru dulu.
export async function getTugasLapangan(teknisiId: string) {
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

export interface AnggotaTim {
  id: string;
  nama: string;
  email: string;
}

// Kontrak: GET /api/laporan/all -> { success, data: Laporan[] } terbaru dulu.
export async function getLaporanAdmin(status?: string) {
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

// Kontrak: POST /api/auth/login -> { success, data: { user, token } };
// kredensial salah = 401 dan apiFetch melempar Error "[401] ...".
export async function loginPengguna(
  email: string,
  password: string
): Promise<SesiPengguna> {
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

