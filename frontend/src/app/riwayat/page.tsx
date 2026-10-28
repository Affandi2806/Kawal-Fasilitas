"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getRiwayat,
  loadPelapor,
  RIWAYAT_DEMO,
  type Laporan,
} from "@/lib/api";

const TANGGAL = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// Pemetaan status mentah backend ke label + warna badge (4 warna spek issue).
const STATUS: Record<string, { label: string; badge: string; dot: string }> = {
  pending: { label: "Menunggu Validasi", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  diverifikasi: { label: "Diproses", badge: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  dalam_perbaikan: { label: "Diproses", badge: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  selesai: { label: "Selesai", badge: "bg-green-100 text-green-800", dot: "bg-green-600" },
  ditolak: { label: "Ditolak", badge: "bg-red-100 text-red-800", dot: "bg-red-500" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, badge: "bg-gray-100 text-gray-700", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function ChipKategori({ kategori }: { kategori: string }) {
  return (
    <span className="inline-block rounded border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700">
      {kategori}
    </span>
  );
}

function AlasanDitolak({ alasan }: { alasan: string }) {
  return (
    <div className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2.5">
      <p className="text-xs font-bold text-red-800">Alasan penolakan</p>
      <p className="mt-1 text-sm leading-snug text-red-800">{alasan}</p>
    </div>
  );
}

export default function RiwayatPage() {
  const [wargaId, setWargaId] = useState<string | null>(null);
  const [laporan, setLaporan] = useState<Laporan[] | null>(null);
  const [gagal, setGagal] = useState(false);
  const [menyegarkan, setMenyegarkan] = useState(false);

  const muat = useCallback(async () => {
    if (!wargaId) return;
    setMenyegarkan(true);
    try {
      setLaporan(await getRiwayat(wargaId));
      setGagal(false);
    } catch {
      setGagal(true);
    } finally {
      setMenyegarkan(false);
    }
  }, [wargaId]);

  useEffect(() => {
    const p = loadPelapor();
    // Mode demo boleh tampil tanpa pelapor karena datanya memang contoh;
    // mode asli tetap butuh identitas pelapor di perangkat ini.
    const id = p?.id != null ? String(p.id) : RIWAYAT_DEMO ? "demo" : null;
    if (id) setWargaId(id);
  }, []);

  useEffect(() => {
    if (!wargaId) return;
    muat();
    const t = setInterval(muat, 30000);
    return () => clearInterval(t);
  }, [wargaId, muat]);

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-gray-900 p-4 py-6 max-w-xl mx-auto">
      <header className="mb-6">
        <a href="/" className="text-green-600 hover:underline block mb-2">
          ← Kembali
        </a>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Riwayat Laporan</h1>
            <p className="text-gray-600">Pantau status laporan yang pernah Anda kirim.</p>
          </div>
          {wargaId && (
            <button
              onClick={() => muat()}
              disabled={menyegarkan}
              className="shrink-0 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium leading-6 text-green-800 hover:bg-gray-50 disabled:opacity-50"
            >
              {menyegarkan ? "Memperbarui…" : "Perbarui"}
            </button>
          )}
        </div>
        {wargaId && (
          <p className="mt-2 text-xs text-gray-500">
            {RIWAYAT_DEMO ? "Mode pratinjau: data di bawah hanya contoh. " : ""}Daftar diperbarui otomatis setiap 30 detik.
          </p>
        )}
      </header>

      {!wargaId ? (
        <div className="rounded-lg border bg-white p-6 text-center">
          <h2 className="text-lg font-bold">Belum ada data pelapor</h2>
          <p className="mt-1 text-sm text-gray-600">
            Kirim satu laporan kerusakan dulu, nanti statusnya bisa Anda pantau di sini.
          </p>
          <a
            href="/lapor"
            className="mt-4 inline-block rounded-lg bg-green-700 px-5 py-2.5 font-semibold leading-6 text-white hover:bg-green-800"
          >
            Lapor Kerusakan
          </a>
        </div>
      ) : gagal ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800">
          <p className="text-sm leading-snug">Gagal memuat riwayat laporan. Periksa koneksi Anda lalu coba lagi.</p>
          <button
            onClick={() => muat()}
            className="mt-3 rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold leading-6 text-red-800 hover:bg-red-100"
          >
            Coba Lagi
          </button>
        </div>
      ) : laporan === null ? (
        <p className="py-16 text-center text-sm text-gray-500">Memuat laporan…</p>
      ) : laporan.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-center">
          <h2 className="text-lg font-bold">Belum ada laporan</h2>
          <p className="mt-1 text-sm text-gray-600">
            Semua laporan yang Anda kirim akan tampil di sini beserta status terkininya.
          </p>
          <a
            href="/lapor"
            className="mt-4 inline-block rounded-lg bg-green-700 px-5 py-2.5 font-semibold leading-6 text-white hover:bg-green-800"
          >
            Lapor Kerusakan
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {laporan.map((l) => (
            <article key={String(l.id)} className="rounded-lg border border-gray-200 bg-white p-4">
              {l.foto_url ? (
                <img
                  src={l.foto_url}
                  alt={`Foto laporan: ${l.judul}`}
                  className="h-44 w-full rounded-lg border border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-brand-300 bg-brand-50">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-brand-600"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <ChipKategori kategori={l.kategori} />
                </div>
              )}
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {l.foto_url && (
                    <div className="mb-1.5">
                      <ChipKategori kategori={l.kategori} />
                    </div>
                  )}
                  <h2 className="text-base font-bold leading-snug">{l.judul}</h2>
                  <p className="mt-1 text-sm text-gray-600">{TANGGAL.format(new Date(l.created_at))}</p>
                  <p className="mt-1.5 flex items-start gap-1.5 text-sm text-gray-600">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 shrink-0 text-gray-400"
                      aria-hidden="true"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="break-words">{l.lokasi}</span>
                  </p>
                </div>
                <StatusBadge status={l.status} />
              </div>
              {l.status === "ditolak" && l.alasan_penolakan && (
                <AlasanDitolak alasan={l.alasan_penolakan} />
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
