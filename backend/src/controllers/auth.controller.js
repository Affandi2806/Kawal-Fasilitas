import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import * as User from '../models/users.model.js';
import { signToken } from '../utils/jwt.js';
import { googleAuth } from '../config/google.js';
import { httpError } from '../middlewares/errorHandler.js';

// POST /api/auth/register — publik, selalu membuat role 'warga'.
// Akun admin / tim_lapangan dibuat oleh admin via POST /api/users.
export async function register(req, res, next) {
  try {
    const { nama, email, password } = req.body;
    if (!nama || !email || !password) {
      throw httpError(400, 'nama, email, dan password wajib diisi');
    }
    // Sebelumnya "bukan-email" lolos lalu 201 (tes live audit 2026-11-07).
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw httpError(400, 'format email tidak valid');
    }
    if (password.length < 6) {
      throw httpError(400, 'password minimal 6 karakter');
    }
    if (await User.findByEmail(email)) {
      throw httpError(409, 'Email sudah terdaftar');
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ nama, email, password_hash, role: 'warga' });
    const token = signToken(user);
    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) { next(err); }
}

// POST /api/auth/login — publik.
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw httpError(400, 'email dan password wajib diisi');
    }
    const user = await User.findByEmail(email);
    // Pesan generik agar tidak membocorkan email mana yang terdaftar.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw httpError(401, 'Email atau password salah');
    }
    const token = signToken(user);
    const { password_hash: _ignored, ...publicUser } = user;
    res.json({ success: true, data: { user: publicUser, token } });
  } catch (err) { next(err); }
}

// POST /api/auth/google — publik. Warga masuk pakai Google Sign-In:
// FE kirim { id_token } dari Google Identity Services, token diverifikasi
// ke Google (signature + audience + masa berlaku), lalu ditukar dengan
// JWT aplikasi kita (bukan token Google).
// - Email belum ada -> user baru role 'warga' (201).
// - Email sudah ada -> pakai user itu apa adanya (200, tidak duplikat,
//   role lama dipertahankan — admin yang masuk lewat Google tetap admin).
// - password_hash diisi hash acak yang tidak bisa ditebak: user Google
//   masuknya lewat Google, bukan lewat /login.
export async function googleLogin(req, res, next) {
  try {
    const { id_token } = req.body ?? {};
    if (!id_token) throw httpError(400, 'id_token wajib diisi');
    let payload;
    try {
      payload = await googleAuth.verifyIdToken(id_token);
    } catch (err) {
      // Salah konfigurasi server (bukan salah client): biarkan 500.
      if (err.message.includes('GOOGLE_CLIENT_ID')) throw err;
      if (/expired|too late/i.test(err.message)) {
        throw httpError(401, 'ID token Google sudah kedaluwarsa');
      }
      if (/audience|Wrong recipient/i.test(err.message)) {
        throw httpError(401, 'Audience ID token tidak cocok dengan aplikasi ini');
      }
      throw httpError(401, 'ID token Google tidak valid');
    }
    if (!payload.email) throw httpError(401, 'ID token Google tidak memuat email');
    if (payload.email_verified === false) {
      throw httpError(401, 'Email Google belum terverifikasi');
    }
    let user = await User.findByEmail(payload.email);
    let status = 200;
    if (!user) {
      const password_hash = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
      user = await User.create({
        nama: payload.name || payload.email.split('@')[0],
        email: payload.email,
        password_hash,
        role: 'warga',
      });
      status = 201;
    }
    const token = signToken(user);
    const { password_hash: _ignored, ...publicUser } = user;
    res.status(status).json({ success: true, data: { user: publicUser, token } });
  } catch (err) { next(err); }
}

// GET /api/auth/me — butuh token. Mengembalikan profil user aktif.
export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw httpError(404, 'User tidak ditemukan');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}
