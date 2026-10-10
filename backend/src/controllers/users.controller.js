import bcrypt from 'bcryptjs';
import * as User from '../models/users.model.js';
import { httpError } from '../middlewares/errorHandler.js';

const VALID_ROLES = ['admin', 'teknisi', 'pelapor'];

export async function getAll(req, res, next) {
  try {
    res.json({ success: true, data: await User.findAll() });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw httpError(404, 'User tidak ditemukan');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function register(req, res, next) {
  try {
    const { nama, email, password, role = 'pelapor' } = req.body;
    if (!nama || !email || !password) {
      throw httpError(400, 'nama, email, dan password wajib diisi');
    }
    if (!VALID_ROLES.includes(role)) {
      throw httpError(400, `role harus salah satu dari: ${VALID_ROLES.join(', ')}`);
    }
    if (await User.findByEmail(email)) {
      throw httpError(409, 'Email sudah terdaftar');
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ nama, email, password_hash, role });
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const { nama, email, password, role } = req.body;
    const fields = {};
    if (nama) fields.nama = nama;
    if (email) fields.email = email;
    if (role) {
      if (!VALID_ROLES.includes(role)) {
        throw httpError(400, `role harus salah satu dari: ${VALID_ROLES.join(', ')}`);
      }
      fields.role = role;
    }
    if (password) fields.password_hash = await bcrypt.hash(password, 10);
    const user = await User.updateById(req.params.id, fields);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw httpError(404, 'User tidak ditemukan');
    await User.deleteById(req.params.id);
    res.json({ success: true, message: 'User dihapus' });
  } catch (err) { next(err); }
}
