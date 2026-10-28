import * as Laporan from '../models/laporan.model.js';
import { httpError } from '../middlewares/errorHandler.js';
import { uploadFotoLaporan } from '../config/storage.js';

const VALID_STATUS = ['pending', 'diverifikasi', 'dalam_perbaikan', 'selesai', 'ditolak'];

export async function getAll(req, res, next) {
  try {
    const { status, user_id } = req.query;
    res.json({ success: true, data: await Laporan.findAll({ status, user_id }) });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const laporan = await Laporan.findById(req.params.id);
    if (!laporan) throw httpError(404, 'Laporan tidak ditemukan');
    res.json({ success: true, data: laporan });
  } catch (err) { next(err); }
}

// GET /api/laporan/warga/:id — riwayat laporan satu warga, terbaru dulu.
// Warga hanya boleh melihat riwayatnya sendiri; admin boleh melihat siapa saja.
export async function getByWarga(req, res, next) {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw httpError(403, 'Hanya boleh melihat riwayat laporan sendiri');
    }
    const { status } = req.query;
    res.json({ success: true, data: await Laporan.findByUserId(id, { status }) });
  } catch (err) { next(err); }
}

// Validasi koordinat GPS dari form-data (selalu string) atau JSON (angka).
// Kosong = null (opsional). Di luar rentang = 400.
function parseCoordinate(value, name, min, max) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < min || num > max) {
    throw httpError(400, `${name} harus angka antara ${min} dan ${max}`);
  }
  return num;
}

export async function create(req, res, next) {
  try {
    // user_id selalu dari token — client tidak bisa mengatasnamakan user lain.
    const user_id = req.user.id;
    const { judul, deskripsi, lokasi, kategori, foto_url } = req.body;
    if (!judul || !deskripsi || !lokasi) {
      throw httpError(400, 'judul, deskripsi, dan lokasi wajib diisi');
    }
    const latitude = parseCoordinate(req.body.latitude, 'latitude', -90, 90);
    const longitude = parseCoordinate(req.body.longitude, 'longitude', -180, 180);

    // Foto: file multipart diutamakan; kalau tidak ada file,
    // pakai foto_url dari body (kompatibel dengan frontend lama
    // yang mengirim foto sebagai data URL).
    let finalFotoUrl = foto_url ?? null;
    if (req.file) {
      const { publicUrl } = await uploadFotoLaporan(req.file.buffer, {
        userId: user_id,
        mimetype: req.file.mimetype,
      });
      finalFotoUrl = publicUrl;
    }

    const laporan = await Laporan.create({
      user_id, judul, deskripsi, lokasi, kategori: kategori ?? null,
      foto_url: finalFotoUrl, latitude, longitude,
    });
    res.status(201).json({ success: true, data: laporan });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    if (!(await Laporan.findById(req.params.id))) {
      throw httpError(404, 'Laporan tidak ditemukan');
    }
    const { status } = req.body;
    if (status && !VALID_STATUS.includes(status)) {
      throw httpError(400, `status harus salah satu dari: ${VALID_STATUS.join(', ')}`);
    }
    if (req.body.latitude !== undefined) {
      req.body.latitude = parseCoordinate(req.body.latitude, 'latitude', -90, 90);
    }
    if (req.body.longitude !== undefined) {
      req.body.longitude = parseCoordinate(req.body.longitude, 'longitude', -180, 180);
    }
    const laporan = await Laporan.updateById(req.params.id, req.body);
    res.json({ success: true, data: laporan });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    if (!(await Laporan.findById(req.params.id))) {
      throw httpError(404, 'Laporan tidak ditemukan');
    }
    await Laporan.deleteById(req.params.id);
    res.json({ success: true, message: 'Laporan dihapus' });
  } catch (err) { next(err); }
}
