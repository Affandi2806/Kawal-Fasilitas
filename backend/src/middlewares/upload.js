import multer from 'multer';
import { httpError } from './errorHandler.js';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  // Foto disimpan di memori lalu diunggah ke Supabase Storage
  // (tidak ada file yang menumpuk di disk server).
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    return cb(httpError(400, 'Foto harus berformat JPG, PNG, atau WebP'));
  },
});

// Terima satu file foto dari field form-data bernama "foto".
// Request non-multipart (mis. JSON biasa) dilewatkan apa adanya
// supaya POST /api/laporan lama yang mengirim foto_url tetap jalan.
export function uploadFoto(req, res, next) {
  if (!req.is('multipart/form-data')) return next();
  upload.single('foto')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(httpError(400, 'Ukuran foto maksimal 5 MB'));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(
        httpError(400, 'Field foto harus bernama "foto" dan hanya satu file')
      );
    }
    next(err);
  });
}
