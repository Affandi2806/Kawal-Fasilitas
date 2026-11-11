"use client";

import { useEffect, useState } from "react";

import GoogleSignInButton from "@/components/GoogleSignInButton";
import { bacaSesi, hapusSesi, ruteUntukRole, type SesiPengguna } from "@/lib/api";

function keluar() {
  hapusSesi();
  window.location.reload();
}

export default function WargaMasukPanel() {
  // undefined = belum mount; localStorage hanya ada di klien.
  const [sesi, setSesi] = useState<SesiPengguna | null | undefined>(undefined);

  useEffect(() => setSesi(bacaSesi()), []);

  return (
    <div className="mx-auto mt-10 max-w-md rounded-lg border p-6 text-center">
      {sesi === undefined ? (
        <div className="h-32" aria-hidden />
      ) : sesi === null ? (
        <>
          <p className="text-sm text-gray-500">Khusus warga</p>
          <div className="mt-3">
            <GoogleSignInButton redirectTo="/" />
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Masuk sekali dengan Google, setelah itu tombol Lapor dan Pantau
            langsung bisa dipakai tanpa masuk lagi.
          </p>
        </>
      ) : sesi.role === "warga" ? (
        <>
          <p className="font-medium">Masuk sebagai {sesi.nama}</p>
          <p className="mt-1 text-sm text-gray-500">{sesi.email}</p>
          <button
            type="button"
            onClick={keluar}
            className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Keluar
          </button>
        </>
      ) : (
        <>
          <p className="font-medium">
            Masuk sebagai {sesi.nama} ({sesi.role})
          </p>
          <a
            href={ruteUntukRole(sesi.role)}
            className="mt-2 inline-block text-sm text-green-600 hover:underline"
          >
            Buka {ruteUntukRole(sesi.role)}
          </a>
          <button
            type="button"
            onClick={keluar}
            className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Keluar
          </button>
        </>
      )}
    </div>
  );
}
