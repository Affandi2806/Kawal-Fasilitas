export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Kawal Fasilitas</h1>
        <p className="mt-4 text-lg text-gray-600">
          Laporkan kerusakan fasilitas umum desa dan pantau progres
          perbaikannya.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="#"
            className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
          >
            Lapor Kerusakan
          </a>
          <a
            href="#"
            className="rounded-lg border border-gray-300 px-6 py-3 font-medium hover:bg-gray-50"
          >
            Pantau Laporan
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <h2 className="text-xl font-semibold">Alur Kerja MVP</h2>
        <ol className="mt-4 space-y-3">
          <li className="rounded-lg border p-4">
            <strong>1. Warga melapor</strong> &mdash; foto, lokasi, dan
            deskripsi kerusakan.
          </li>
          <li className="rounded-lg border p-4">
            <strong>2. Laporan diverifikasi</strong> &mdash; admin desa
            meninjau laporan masuk.
          </li>
          <li className="rounded-lg border p-4">
            <strong>3. Perbaikan dipantau</strong> &mdash; status terlihat
            publik sampai selesai.
          </li>
        </ol>
        <p className="mt-6 text-sm text-gray-500">
          Status proyek: setup awal (Next.js + PWA) &mdash; issue #1.
        </p>
      </section>
    </main>
  );
}
