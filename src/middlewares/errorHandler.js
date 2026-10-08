// Centralized error handler: semua error dari controller/route
// diteruskan ke sini via next(err).
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Terjadi kesalahan pada server';
  if (process.env.NODE_ENV !== 'test') console.error('[ERROR]', err);
  res.status(status).json({ success: false, message });
}

export function notFound(_req, res) {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
}

// Helper kecil: lempar error dengan status HTTP tertentu.
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
