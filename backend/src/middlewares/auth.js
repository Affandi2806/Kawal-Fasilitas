import { verifyToken } from '../utils/jwt.js';
import { findById } from '../models/users.model.js';
import { httpError } from './errorHandler.js';

// Wajib: request membawa header `Authorization: Bearer <token>`.
// Menempelkan user aktif di req.user = { id, role }.
export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw httpError(401, 'Token autentikasi tidak ditemukan');
    }
    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw httpError(401, 'Token tidak valid atau sudah kedaluwarsa');
    }
    // Pastikan user masih ada di database (misal setelah dihapus admin).
    const user = await findById(payload.sub);
    if (!user) throw httpError(401, 'User tidak ditemukan');
    req.user = { id: user.id, role: user.role, nama: user.nama, email: user.email };
    next();
  } catch (err) {
    next(err);
  }
}

// Batasi route ke peran tertentu. Pakai setelah authenticate.
// Contoh: authorize('admin') atau authorize('admin', 'tim_lapangan')
export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) return next(httpError(401, 'Belum terautentikasi'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        httpError(403, `Akses ditolak: butuh peran ${allowedRoles.join(' / ')}`)
      );
    }
    next();
  };
}
