"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { bacaSesi, loginPengguna, ruteUntukRole, simpanSesi } from "@/lib/api";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [proses, setProses] = useState(false);

  // Sesi aktif tidak perlu di halaman ini, langsung ke halaman role-nya.
  useEffect(() => {
    const sesi = bacaSesi();
    if (sesi) router.push(ruteUntukRole(sesi.role));
  }, [router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setProses(true);
    setError("");
    try {
      const sesi = await loginPengguna(email, password);
      simpanSesi(sesi);
      router.push(ruteUntukRole(sesi.role));
    } catch (err) {
      const pesan = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(pesan.includes("401") ? "Email atau password salah" : pesan);
    } finally {
      setProses(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAF8] p-4 text-gray-900">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-green-600">Kawal-Fasilitas</h1>
          <p className="mt-1 font-semibold">Masuk untuk Pegawai</p>
          <p className="mt-1 text-sm text-gray-600">
            Masuk untuk memverifikasi laporan atau menangani perbaikan fasilitas desa.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-4 space-y-3">
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-green-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Kata sandi
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-green-700 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={proses}
              className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {proses ? "Memproses…" : "Masuk"}
            </button>
          </form>

          <div className="mt-5">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-500">atau</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>
            <p className="mt-4 text-xs font-medium text-gray-500">Khusus warga</p>
            <div className="mt-1.5">
              <GoogleSignInButton redirectTo="/" />
            </div>
          </div>
        </div>

        <a
          href="/"
          className="mt-4 block text-center text-sm text-green-600 hover:underline"
        >
          ← Kembali ke Beranda
        </a>
      </div>
    </main>
  );
}
