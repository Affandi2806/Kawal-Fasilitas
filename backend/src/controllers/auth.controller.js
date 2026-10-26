import bcrypt from 'bcryptjs';
import * as User from '../models/users.model.js';
import { signToken } from '../utils/jwt.js';
import { httpError } from '../middlewares/errorHandler.js';

// POST /api/auth/register — publik, selalu membuat role 'warga'.
// Akun admin / tim_lapangan dibuat oleh admin via POST /api/users.
export async function register(req, res, next) {
  try {
    const { nama, email, password } = req.body;
    if (!nama || !email || !password) {
      throw httpError(400, 'nama, email, dan password wajib diisi');
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

// GET /api/auth/me — butuh token. Mengembalikan profil user aktif.
export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw httpError(404, 'User tidak ditemukan');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}
