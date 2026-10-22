"use client";

import { useRouter } from "next/navigation";

import {
  loadPelapor,
  savePelapor,
  registerPelapor,
  findPelaporByEmail,
  createLaporan,
} from "@/lib/api";



import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

function pesanErrorGeo(err: GeolocationPositionError) {
  switch (err.code) {
    case 1:
      return "Izin lokasi ditolak. Aktifkan izin lokasi, atau isi nama tempat secara manual.";
    case 2:
      return "Lokasi tidak tersedia saat ini.";
    case 3:
      return "Pencarian lokasi terlalu lama. Coba Perbarui Lokasi.";
    default:
      return err.message;
  }
}

export default function LaporPage() {

  const router = useRouter();
  const [submitted, setSubmitted] = useState<any>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [kategori, setKategori] = useState("");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [lokasiNama, setLokasiNama] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [geoStatus, setGeoStatus] = useState("Mendeteksi lokasi…");

  // load stored reporter info
  useEffect(() => {
    const stored = loadPelapor();
    if (stored) {
      setNama(stored.nama);
      setEmail(stored.email);
    }
  }, []);

  // get geolocation once on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation tidak didukung.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
setGeoStatus(
  `Koordinat: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)} · akurasi ±${Math.round(pos.coords.accuracy)} m`
);
      },
      (err) => setGeoStatus(pesanErrorGeo(err)),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      // resize using canvas
      const img = new Image();
      img.onload = () => {
        const max = 1280;
        const { width, height } = img;
        const ratio = Math.min(max / width, max / height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          setPhoto(dataUrl);
          setPreview(dataUrl);
        }
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!photo) return "Foto wajib diisi.";
    if (!kategori) return "Kategori wajib dipilih.";
    if (!judul) return "Judul wajib diisi.";
    if (deskripsi.length < 10) return "Deskripsi minimal 10 karakter.";
    if (!lokasiNama && !coords) return "Lokasi wajib diisi.";
    if (nama.trim().length < 3) return "Nama minimal 3 karakter.";
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) return "Email tidak valid.";
    return "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if (msg) { setError(msg); return; }
    setError("");
    setLoading(true);
    try {
      // determine user_id
      let pelapor = loadPelapor();
      if (!pelapor || pelapor.email !== email) {
        try {
          pelapor = await registerPelapor(nama, email);
        } catch (err: any) {
          if (err.message.includes("409")) {
            const existing = await findPelaporByEmail(email);
            pelapor = existing;
          } else throw err;
        }
        savePelapor(pelapor);
      }
      const lokasi =
        lokasiNama && coords
          ? `${lokasiNama} (${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)})`
          : lokasiNama
          ? lokasiNama
          : `Titik GPS (${coords!.lat.toFixed(6)}, ${coords!.lng.toFixed(6)})`;
const hasil = await createLaporan({
          user_id: pelapor.id,
          judul,
          deskripsi,
          lokasi,
          kategori,
          foto_url: photo!,
        });
        setSubmitted(hasil);
    } catch (e: any) {
      setError(e.message || "Gagal mengirim laporan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-gray-900 p-4 py-6 max-w-xl mx-auto">
      <header className="mb-6">
        <a href="/" className="text-green-600 hover:underline block mb-2">
          ← Kembali
        </a>
        <h1 className="text-2xl font-bold">Lapor Kerusakan Fasilitas</h1>
        <p className="text-gray-600">Isi formulir berikut untuk melaporkan kerusakan.</p>
      </header>
        {error && <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-red-800">{error}</div>}
        {submitted ? (
          <div className="rounded-lg border border-green-700 bg-white p-6 text-center">
            <svg className="mx-auto mb-2" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            <h2 className="text-xl font-bold mb-2">Laporan Terkirim</h2>
            <p className="mb-1">Nomor laporan: {String(submitted.id).slice(0,8)}</p>
            <p className="mb-4">Status: Menunggu Validasi</p>
            <button onClick={() => {
              setSubmitted(null);
              setPhoto(null);
              setPreview(null);
              setKategori("");
              setJudul("");
              setDeskripsi("");
              setLokasiNama("");
              setNama("");
              setEmail("");
              setLoading(false);
              setError("");
            }} className="mr-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-green-800">Buat Laporan Lain</button>
            <a href="/" className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-green-800">Kembali ke Beranda</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Foto */}
            <div>

              {preview ? (
                <div className="mb-2">
                  <img src={preview} alt="preview" className="rounded-lg border max-h-56 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPreview(null); }}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-green-800"
                  >
                    Ganti Foto
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input id="captureInput" type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
                  <input id="galleryInput" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  <label htmlFor="captureInput" className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-3 text-center font-medium cursor-pointer">
                    <svg className="inline-block mr-1" width="16" height="16" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    Ambil Foto
                  </label>
                  <label htmlFor="galleryInput" className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-3 text-center font-medium cursor-pointer">
                    <svg className="inline-block mr-1" width="16" height="16" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2"/></svg>
                    Pilih dari Galeri
                  </label>
                </div>
              )}
            </div>
            {/* Section 1 */}
            <section className="space-y-2">
              <div className="flex items-center space-x-2 mb-1">
                <span className="bg-green-700 text-white text-xs font-bold px-2 py-0.5 rounded">1</span>
                <span className="font-bold">Foto Kerusakan</span>
              </div>
              {/* already rendered above */}
            </section>
            {/* Kategori & Judul */}
            <section className="space-y-2">
              <div className="flex items-center space-x-2 mb-1">
                <span className="bg-green-700 text-white text-xs font-bold px-2 py-0.5 rounded">2</span>
                <span className="font-bold">Kategori & Judul</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  "Jalan Rusak",
                  "Lampu Jalan",
                  "Drainase & Selokan",
                  "Sampah",
                  "Jembatan",
                  "Fasilitas Umum",
                  "Lainnya",
                ].map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setKategori(cat)}
                    className={`px-3 py-1 rounded border ${kategori === cat ? "bg-green-600 text-white" : "bg-white"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <label className="block font-medium mb-1">Judul laporan</label>
              <input
                type="text"
                placeholder="Judul laporan…"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 focus:outline-none focus:border-green-700"
              />
            </section>
            {/* Deskripsi */}
            <section className="space-y-2">
              <div className="flex items-center space-x-2 mb-1">
                <span className="bg-green-700 text-white text-xs font-bold px-2 py-0.5 rounded">3</span>
                <span className="font-bold">Deskripsi Kerusakan</span>
              </div>
              <textarea
                placeholder="Deskripsi detail kerusakan…"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 h-24 focus:outline-none focus:border-green-700"
              />
            </section>
            {/* Lokasi */}
            <section className="space-y-2">
              <div className="flex items-center space-x-2 mb-1">
                <span className="bg-green-700 text-white text-xs font-bold px-2 py-0.5 rounded">4</span>
                <span className="font-bold">Lokasi</span>
              </div>
              <input
                type="text"
                placeholder="Nama tempat atau patokan"
                value={lokasiNama}
                onChange={(e) => setLokasiNama(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 mb-1 focus:outline-none focus:border-green-700"
              />
              <div className="text-sm text-gray-600 mb-1">{geoStatus}</div>
              <button
                type="button"
                onClick={() => {
                  setGeoStatus("Mendeteksi lokasi…");
                  navigator.geolocation.getCurrentPosition(
                    (p) => {
                      setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
setGeoStatus(
  `Koordinat: ${p.coords.latitude.toFixed(6)}, ${p.coords.longitude.toFixed(6)} · akurasi ±${Math.round(p.coords.accuracy)} m`
);
                    },
                    (e) => setGeoStatus(pesanErrorGeo(e))
                  );
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-green-800"
              >
                Perbarui Lokasi
              </button>
              {coords && (
                <a
                  href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noopener"
                  className="block text-blue-600 hover:underline text-sm mt-1"
                >
                  Lihat di Peta
                </a>
              )}
            </section>
            {/* Data Pelapor */}
            <section className="space-y-2">
              <div className="flex items-center space-x-2 mb-1">
                <span className="bg-green-700 text-white text-xs font-bold px-2 py-0.5 rounded">5</span>
                <span className="font-bold">Data Pelapor</span>
              </div>
              <label className="block font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 mb-1 focus:outline-none focus:border-green-700"
              />
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Identitas pelapor disimpan di perangkat ini untuk laporan berikutnya.
              </p>
            </section>
            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? "Mengirim…" : "Kirim Laporan"}
            </button>
          </form>
        )}

    </main>
  );
}
