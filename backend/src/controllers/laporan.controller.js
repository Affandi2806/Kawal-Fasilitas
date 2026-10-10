import * as Laporan from '../models/laporan.model.js';
import { findById as findUser } from '../models/users.model.js';
import { httpError } from '../middlewares/errorHandler.js';

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

export async function create(req, res, next) {
  try {
    const { user_id, judul, deskripsi, lokasi, kategori, foto_url } = req.body;
    if (!user_id || !judul || !deskripsi || !lokasi) {
      throw httpError(400, 'user_id, judul, deskripsi, dan lokasi wajib diisi');
    }
    if (!(await findUser(user_id))) throw httpError(404, 'User pelapor tidak ditemukan');
    const laporan = await Laporan.create({
      user_id, judul, deskripsi, lokasi, kategori: kategori ?? null, foto_url: foto_url ?? null,
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
