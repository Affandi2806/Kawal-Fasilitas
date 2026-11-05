import type { SesiPengguna } from "./api";

// Akun demo HANYA untuk pratinjau desain /login (NEXT_PUBLIC_LOGIN_DEMO=1),
// bukan data nyata. Budi Santoso konsisten dengan teknisi demo di /tim-lapangan.
export const AKUN_DEMO: Array<Omit<SesiPengguna, "token"> & { password: string }> = [
  {
    id: "demo-admin",
    nama: "Admin Desa",
    email: "admin@kawal.desa",
    password: "admin123",
    role: "admin",
  },
  {
    id: "demo-lapangan",
    nama: "Budi Santoso",
    email: "budi@kawal.desa",
    password: "lapangan123",
    role: "tim_lapangan",
  },
];

export function cariAkunDemo(
  email: string,
  password: string
): SesiPengguna | null {
  const a = AKUN_DEMO.find((a) => a.email === email && a.password === password);
  return a
    ? { id: a.id, nama: a.nama, email: a.email, role: a.role, token: "demo-token" }
    : null;
}
