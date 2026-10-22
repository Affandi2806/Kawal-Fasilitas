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

export function loadPelapor() {
  const json = localStorage.getItem("kf_pelapor");
  return json ? JSON.parse(json) : null;
}

export function savePelapor(pelapor: any) {
  localStorage.setItem("kf_pelapor", JSON.stringify(pelapor));
}

