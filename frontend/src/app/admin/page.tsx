"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getAnggotaTim,
  getLaporanAdmin,
  disposisiLaporan,
  validasiLaporan,
  type AnggotaTim,
  type Laporan,
} from "@/lib/api";

const TANGGAL = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// Label admin: diverifikasi dan dalam_perbaikan dibedakan (4 warna spek issue).
const STATUS: Record<string, { label: string; badge: string; dot: string }> = {
  pending: { label: "Menunggu", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  diverifikasi: { label: "Terverifikasi", badge: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  dalam_perbaikan: { label: "Dalam Perbaikan", badge: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  selesai: { label: "Selesai", badge: "bg-green-100 text-green-800", dot: "bg-green-600" },
  ditolak: { label: "Ditolak", badge: "bg-red-100 text-red-800", dot: "bg-red-500" },
};

const SARING: { nilai: string; label: string }[] = [
  { nilai: "", label: "Semua" },
  { nilai: "pending", label: "Menunggu" },
  { nilai: "diverifikasi", label: "Terverifikasi" },
  { nilai: "dalam_perbaikan", label: "Dalam Perbaikan" },
  { nilai: "selesai", label: "Selesai" },
  { nilai: "ditolak", label: "Ditolak" },
];

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
    <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2.5">
      <p className="text-xs font-bold text-red-800">Alasan penolakan</p>
      <p className="mt-1 text-sm leading-snug text-red-800">{alasan}</p>
    </div>
  );
}

function KartuLaporan({
  l,
  anggota,
  onPerbarui,
}: {
  l: Laporan;
  anggota: AnggotaTim[];
  onPerbarui: (id: string, patch: Partial<Laporan>) => void;
}) {
  const [mengirim, setMengirim] = useState(false);
  const [bukaTolak, setBukaTolak] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [pilihTim, setPilihTim] = useState("");
  const [pesan, setPesan] = useState<{ jenis: "sukses" | "gagal"; teks: string } | null>(null);

  const jalankan = async (proses: () => Promise<void>, teksSukses: string) => {
    setMengirim(true);
    setPesan(null);
    try {
      await proses();
      setPesan({ jenis: "sukses", teks: teksSukses });
      setBukaTolak(false);
      setAlasan("");
    } catch (e) {
      setPesan({ jenis: "gagal", teks: e instanceof Error ? e.message : "Terjadi kesalahan." });
    } finally {
      setMengirim(false);
    }
  };

  const terima = () =>
    jalankan(async () => {
      await validasiLaporan(l.id, "Diproses");
      onPerbarui(l.id, { status: "diverifikasi", alasan_penolakan: null });
    }, "Laporan diverifikasi. Pilih anggota tim untuk disposisi.");

  const tolak = () =>
    jalankan(async () => {
      await validasiLaporan(l.id, "Ditolak", alasan.trim());
      onPerbarui(l.id, { status: "ditolak", alasan_penolakan: alasan.trim() });
    }, "Laporan ditolak.");

  const tugaskan = () =>
    jalankan(async () => {
      await disposisiLaporan(l.id, pilihTim);
      onPerbarui(l.id, { status: "dalam_perbaikan" });
    }, "Laporan didisposisikan ke tim lapangan.");

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4">
      {l.foto_url && (
        <img
          src={l.foto_url}
          alt={`Foto laporan: ${l.judul}`}
          className="h-44 w-full rounded-lg border border-gray-200 object-cover"
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5">
            <ChipKategori kategori={l.kategori} />
          </div>
          <h2 className="text-base font-bold leading-snug">{l.judul}</h2>
          <p className="mt-1 text-sm text-gray-600">Dibuat {TANGGAL.format(new Date(l.created_at))}</p>
        </div>
        <StatusBadge status={l.status} />
      </div>
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
        <span className="break-words">
          {l.lokasi}
          {l.latitude != null && l.longitude != null && (
            <>
              {" "}
              <a
                href={`https://www.google.com/maps?q=${l.latitude},${l.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="whitespace-nowrap font-medium text-green-600 hover:underline"
              >
                Lihat Lokasi
              </a>
            </>
          )}
        </span>
      </p>
      {l.status === "ditolak" && l.alasan_penolakan && (
        <div className="mt-3">
          <AlasanDitolak alasan={l.alasan_penolakan} />
        </div>
      )}

      {l.status === "pending" && !bukaTolak && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={terima}
            disabled={mengirim}
            className="rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {mengirim ? "Mengirim..." : "Terima"}
          </button>
          <button
            type="button"
            onClick={() => {
              setBukaTolak(true);
              setAlasan("");
              setPesan(null);
            }}
            disabled={mengirim}
            className="rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Tolak
          </button>
        </div>
      )}

      {bukaTolak && (
        <div className="mt-3 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <label htmlFor={`alasan-${l.id}`} className="block text-sm font-medium text-gray-800">
            Alasan penolakan
          </label>
          <textarea
            id={`alasan-${l.id}`}
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            placeholder="Jelaskan alasan laporan ini ditolak…"
            className="h-20 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-green-700"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={tolak}
              disabled={mengirim || alasan.trim() === ""}
              className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {mengirim ? "Mengirim..." : "Tolak Laporan"}
            </button>
            <button
              type="button"
              onClick={() => {
                setBukaTolak(false);
                setAlasan("");
              }}
              disabled={mengirim}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {l.status === "diverifikasi" && (
        <div className="mt-3 flex gap-2">
          <select
            value={pilihTim}
            onChange={(e) => setPilihTim(e.target.value)}
            aria-label="Pilih anggota tim"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-green-700"
          >
            <option value="">Pilih anggota tim</option>
            {anggota.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={tugaskan}
            disabled={mengirim || pilihTim === "" || anggota.length === 0}
            className="shrink-0 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {mengirim ? "Mengirim..." : "Tugaskan"}
          </button>
        </div>
      )}

      {pesan && (
        <p
          className={`mt-3 rounded-lg border px-3 py-2 text-sm leading-snug ${
            pesan.jenis === "sukses"
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          {pesan.teks}
        </p>
      )}
    </article>
  );
}

export default function AdminPage() {
  const [daf, setDaf] = useState<Laporan[] | null>(null);
  const [gagal, setGagal] = useState("");
  const [saring, setSaring] = useState("");
  const [anggota, setAnggota] = useState<AnggotaTim[]>([]);

  const muat = useCallback(async () => {
    setGagal("");
    setDaf(null);
    try {
      setDaf(await getLaporanAdmin(saring || undefined));
    } catch (e) {
      setGagal(e instanceof Error ? e.message : "Terjadi kesalahan");
      return;
    }
    // ponytail: gagal memuat anggota tidak memblokir daftar laporan,
    // dropdown hanya kosong sampai Coba Lagi dimatikan filternya.
    setAnggota(await getAnggotaTim().catch(() => []));
  }, [saring]);

  useEffect(() => {
    muat();
  }, [muat]);

  const perbarui = useCallback((id: string, patch: Partial<Laporan>) => {
    setDaf((prev) => (prev ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-gray-900 p-4 py-6 max-w-xl mx-auto">
      <header className="mb-6">
        <a href="/" className="text-green-600 hover:underline block mb-2">
          ← Kembali
        </a>
        <h1 className="text-2xl font-bold">Dasbor Admin</h1>
        <p className="text-gray-600">Tinjau laporan warga lalu terima, tolak, atau disposisikan ke tim lapangan.</p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter status laporan">
        {SARING.map((s) => (
          <button
            key={s.nilai}
            type="button"
            onClick={() => setSaring(s.nilai)}
            aria-pressed={saring === s.nilai}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              saring === s.nilai
                ? "bg-green-600 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {gagal ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800">
          <p className="text-sm leading-snug">{gagal}</p>
          <button
            onClick={() => muat()}
            className="mt-3 rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold leading-6 text-red-800 hover:bg-red-100"
          >
            Coba Lagi
          </button>
        </div>
      ) : daf === null ? (
        <p className="py-16 text-center text-sm text-gray-500">Memuat laporan…</p>
      ) : daf.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">Tidak ada laporan dengan status ini.</p>
      ) : (
        <div className="space-y-4">
          {daf.map((l) => (
            <KartuLaporan key={l.id} l={l} anggota={anggota} onPerbarui={perbarui} />
          ))}
        </div>
      )}
    </main>
  );
}
