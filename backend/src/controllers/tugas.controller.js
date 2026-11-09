import * as Perbaikan from '../models/perbaikan.model.js';
import * as Laporan from '../models/laporan.model.js';
import { httpError } from '../middlewares/errorHandler.js';
import { uploadFotoAfter } from '../config/storage.js';

// GET /api/tugas/:tim_id — tugas aktif satu teknisi.
// "Aktif" = status dijadwalkan / dikerjakan (selesai dan dibatalkan
// bukan tugas aktif), terbaru dulu, lengkap dengan laporan terkait.
// Admin boleh melihat tugas siapa saja; tim_lapangan hanya tugasnya sendiri.
export async function getTugasAktif(req, res, next) {
  try {
    const { tim_id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== tim_id) {
      throw httpError(403, 'Hanya boleh melihat tugas sendiri');
    }
    res.json({ success: true, data: await Perbaikan.findActiveByTeknisiId(tim_id) });
  } catch (err) { next(err); }
}

// Trigger otomatis: laporan jadi Selesai kalau data perbaikan sudah
// lengkap — status selesai + tanggal_selesai terisi + foto after ada.
// Hanya dari dalam_perbaikan (alur normal disposisi -> eksekusi).
// Dipakai PUT /tugas/:id/selesai dan PATCH /api/perbaikan/:id.
// Kalau trigger ini gagal (mis. database error), error-nya diteruskan —
// perbaikan sudah terlanjur selesai, jadi ulangi saja request-nya
// (PUT selesai idempotent, trigger dicoba lagi).
export async function flipLaporanToSelesaiIfComplete(perbaikan) {
  if (
    !perbaikan ||
    perbaikan.status !== 'selesai' ||
    !perbaikan.tanggal_selesai ||
    !perbaikan.foto_after_url
  ) {
    return;
  }
  const laporan = await Laporan.findById(perbaikan.laporan_id);
  if (!laporan || laporan.status !== 'dalam_perbaikan') return;
  await Laporan.updateById(laporan.id, { status: 'selesai' });
}

// PUT /api/tugas/:id/selesai — Tim Lapangan melaporkan penyelesaian.
// Foto after wajib: file multipart field "foto_after" atau
// foto_after_url di body (kompatibel dengan pengirim JSON).
// tanggal_selesai diisi server (waktu request diterima), catatan opsional.
// Hanya teknisi yang ditugaskan (atau admin) yang boleh menyelesaikan.
// Tugas yang sudah dibatalkan tidak bisa diselesaikan; yang sudah
// selesai boleh diulang (ganti foto / catatan).
export async function selesaikanTugas(req, res, next) {
  try {
    const perbaikan = await Perbaikan.findById(req.params.id);
    if (!perbaikan) throw httpError(404, 'Data perbaikan tidak ditemukan');
    if (req.user.role !== 'admin' && req.user.id !== perbaikan.teknisi_id) {
      throw httpError(403, 'Hanya teknisi yang ditugaskan (atau admin) yang boleh menyelesaikan tugas ini');
    }
    if (perbaikan.status === 'dibatalkan') {
      throw httpError(400, 'Tugas yang dibatalkan tidak bisa diselesaikan');
    }
    let foto_after_url = null;
    if (req.file) {
      const { publicUrl } = await uploadFotoAfter(req.file.buffer, {
        perbaikanId: perbaikan.id,
        mimetype: req.file.mimetype,
      });
      foto_after_url = publicUrl;
    } else {
      foto_after_url = String(req.body.foto_after_url ?? '').trim() || null;
    }
    if (!foto_after_url) {
      throw httpError(400, 'Foto after wajib diunggah (field foto_after atau foto_after_url)');
    }
    const fields = {
      status: 'selesai',
      tanggal_selesai: new Date().toISOString(),
      foto_after_url,
    };
    if (req.body.catatan !== undefined) fields.catatan = req.body.catatan;
    await Perbaikan.updateById(perbaikan.id, fields);
    await flipLaporanToSelesaiIfComplete(
      await Perbaikan.findById(perbaikan.id)
    );
    // Baca ulang supaya relasi laporan di respons sudah Selesai.
    const fresh = await Perbaikan.findById(perbaikan.id);
    res.json({ success: true, data: fresh });
  } catch (err) { next(err); }
}
