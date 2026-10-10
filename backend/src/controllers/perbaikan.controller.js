import * as Perbaikan from '../models/perbaikan.model.js';
import { findById as findLaporan } from '../models/laporan.model.js';
import { findById as findUser } from '../models/users.model.js';
import { httpError } from '../middlewares/errorHandler.js';

const VALID_STATUS = ['dijadwalkan', 'dikerjakan', 'selesai', 'dibatalkan'];

export async function getAll(req, res, next) {
  try {
    const { status, laporan_id, teknisi_id } = req.query;
    res.json({ success: true, data: await Perbaikan.findAll({ status, laporan_id, teknisi_id }) });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const perbaikan = await Perbaikan.findById(req.params.id);
    if (!perbaikan) throw httpError(404, 'Data perbaikan tidak ditemukan');
    res.json({ success: true, data: perbaikan });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { laporan_id, teknisi_id, tanggal_mulai, tanggal_selesai, biaya, catatan } = req.body;
    if (!laporan_id) throw httpError(400, 'laporan_id wajib diisi');
    if (!(await findLaporan(laporan_id))) throw httpError(404, 'Laporan tidak ditemukan');
    if (teknisi_id) {
      const teknisi = await findUser(teknisi_id);
      if (!teknisi) throw httpError(404, 'Teknisi tidak ditemukan');
      if (teknisi.role !== 'teknisi' && teknisi.role !== 'admin') {
        throw httpError(400, 'User yang ditugaskan harus ber-role teknisi atau admin');
      }
    }
    const perbaikan = await Perbaikan.create({
      laporan_id,
      teknisi_id: teknisi_id ?? null,
      tanggal_mulai: tanggal_mulai ?? null,
      tanggal_selesai: tanggal_selesai ?? null,
      biaya: biaya ?? 0,
      catatan: catatan ?? null,
    });
    res.status(201).json({ success: true, data: perbaikan });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    if (!(await Perbaikan.findById(req.params.id))) {
      throw httpError(404, 'Data perbaikan tidak ditemukan');
    }
    const { status, teknisi_id } = req.body;
    if (status && !VALID_STATUS.includes(status)) {
      throw httpError(400, `status harus salah satu dari: ${VALID_STATUS.join(', ')}`);
    }
    if (teknisi_id) {
      const teknisi = await findUser(teknisi_id);
      if (!teknisi) throw httpError(404, 'Teknisi tidak ditemukan');
      if (teknisi.role !== 'teknisi' && teknisi.role !== 'admin') {
        throw httpError(400, 'User yang ditugaskan harus ber-role teknisi atau admin');
      }
    }
    const perbaikan = await Perbaikan.updateById(req.params.id, req.body);
    res.json({ success: true, data: perbaikan });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    if (!(await Perbaikan.findById(req.params.id))) {
      throw httpError(404, 'Data perbaikan tidak ditemukan');
    }
    await Perbaikan.deleteById(req.params.id);
    res.json({ success: true, message: 'Data perbaikan dihapus' });
  } catch (err) { next(err); }
}
