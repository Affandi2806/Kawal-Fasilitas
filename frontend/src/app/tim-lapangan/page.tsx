"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";

import {
  getTugasLapangan,
  selesaikanPerbaikan,
  type Perbaikan,
} from "@/lib/api";
import { TEKNISI_DEMO } from "@/lib/tugas-demo";

const TANGGAL = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// Pemetaan status perbaikan ke label + warna badge (spek issue).
const STATUS: Record<string, { label: string; badge: string; dot: string }> = {
  dijadwalkan: { label: "Dijadwalkan", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  dikerjakan: { label: "Diproses", badge: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  selesai: { label: "Selesai", badge: "bg-green-100 text-green-800", dot: "bg-green-600" },
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

export default function TimLapanganPage() {
  // Identitas teknisi demo; nanti diganti user login ber-role tim_lapangan.
  const [tugas, setTugas] = useState<Perbaikan[] | null>(null);
  const [gagal, setGagal] = useState("");
  const [bukaId, setBukaId] = useState<string | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [catatanSelesai, setCatatanSelesai] = useState("");
  const [mengirim, setMengirim] = useState(false);
  const [errorSelesai, setErrorSelesai] = useState("");
  // Backend tidak punya kolom foto bukti, foto hanya hidup di state klien ini.
  const [fotoBukti, setFotoBukti] = useState<Record<string, string>>({});

  const muat = useCallback(async () => {
    setGagal("");
    try {
      setTugas(await getTugasLapangan(TEKNISI_DEMO.id));
    } catch (e) {
      setGagal(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  // ponytail: foto hanya pratinjau di memori (tak pernah dikirim), jadi tanpa
  // resize canvas seperti /lapor; tambahkan bila foto besar menyulitkan.
  const pilihFoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const tutupForm = () => {
    setBukaId(null);
    setFoto(null);
    setCatatanSelesai("");
    setErrorSelesai("");
  };

  const tandaiSelesai = async () => {
    if (!bukaId) return;
    setMengirim(true);
    setErrorSelesai("");
    try {
      await selesaikanPerbaikan(bukaId, catatanSelesai.trim() || undefined);
      const idSelesai = bukaId;
      setTugas((prev) =>
        (prev ?? []).map((t) =>
          t.id === idSelesai
            ? { ...t, status: "selesai" as const, tanggal_selesai: new Date().toISOString() }
            : t
        )
      );
      if (foto) setFotoBukti((prev) => ({ ...prev, [idSelesai]: foto }));
      tutupForm();
    } catch (e) {
      setErrorSelesai(e instanceof Error ? e.message : "Gagal menyelesaikan tugas.");
    } finally {
      setMengirim(false);
    }
  };

  const aktif = (tugas ?? []).filter(
    (t) => t.status === "dijadwalkan" || t.status === "dikerjakan"
  );
  const selesai = (tugas ?? []).filter((t) => t.status === "selesai");

  const kartu = (t: Perbaikan, aktifBagian: boolean) => (
    <article key={t.id} className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-snug">{t.laporan?.judul}</h3>
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
            <span className="break-words">{t.laporan?.lokasi}</span>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Mulai {TANGGAL.format(new Date(t.tanggal_mulai))}
          </p>
          {t.catatan && (
            <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {t.catatan}
            </p>
          )}
          {fotoBukti[t.id] && (
            <img
              src={fotoBukti[t.id]}
              alt={`Foto bukti: ${t.laporan?.judul}`}
              className="mt-3 h-20 w-20 rounded-lg border border-gray-200 object-cover"
            />
          )}
        </div>
        <StatusBadge status={t.status} />
      </div>

      {aktifBagian && t.id !== bukaId && (
        <button
          onClick={() => {
            setBukaId(t.id);
            setFoto(null);
            setCatatanSelesai("");
            setErrorSelesai("");
          }}
          className="mt-3 w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          Selesaikan Tugas
        </button>
      )}

      {aktifBagian && t.id === bukaId && (
        <div className="mt-3 space-y-3 rounded-lg border border-gray-200 p-3">
          {errorSelesai && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
              {errorSelesai}
            </div>
          )}
          {foto ? (
            <div>
              <img
                src={foto}
                alt="Pratinjau foto bukti"
                className="max-h-40 rounded-lg border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() => setFoto(null)}
                className="mt-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-gray-50"
              >
                Ganti Foto
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer rounded-lg border border-dashed border-gray-300 bg-white px-3 py-3 text-center text-sm font-medium text-green-800 hover:bg-gray-50">
              <input
                type="file"
                accept="image/*"
                onChange={pilihFoto}
                className="sr-only"
              />
              Pilih Foto Bukti
            </label>
          )}
          <textarea
            placeholder="Catatan penyelesaian (opsional)…"
            value={catatanSelesai}
            onChange={(e) => setCatatanSelesai(e.target.value)}
            className="h-20 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-green-700"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={tandaiSelesai}
              disabled={mengirim || !foto}
              className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {mengirim ? "Mengirim…" : "Tandai Selesai"}
            </button>
            <button
              type="button"
              onClick={tutupForm}
              disabled={mengirim}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </article>
  );

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-gray-900 p-4 py-6 max-w-xl mx-auto">
      <header className="mb-6">
        <a href="/" className="text-green-600 hover:underline block mb-2">
          ← Kembali
        </a>
        <h1 className="text-2xl font-bold">Tugas Lapangan</h1>
        <p className="text-gray-600">Tugas perbaikan untuk {TEKNISI_DEMO.nama}</p>
      </header>

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
      ) : tugas === null ? (
        <p className="py-16 text-center text-sm text-gray-500">Memuat tugas...</p>
      ) : (
        <>
          <section className="mb-6">
            <h2 className="text-lg font-bold">Tugas Aktif</h2>
            {aktif.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">Tidak ada tugas aktif saat ini.</p>
            ) : (
              <div className="mt-3 space-y-4">{aktif.map((t) => kartu(t, true))}</div>
            )}
          </section>

          {selesai.length > 0 && (
            <section>
              <h2 className="text-lg font-bold">Selesai</h2>
              <div className="mt-3 space-y-4">{selesai.map((t) => kartu(t, false))}</div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
