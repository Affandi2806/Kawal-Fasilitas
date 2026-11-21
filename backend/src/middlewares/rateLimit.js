// Rate limit in-memory sederhana (tanpa dependensi): sliding window
// per IP. Cocok untuk satu instance; kalau nanti di-scale out,
// ganti ke penyimpanan bersama (mis. Redis).
export function createRateLimiter({ windowMs, max, message }) {
  // ip -> array timestamp request dalam jendela berjalan.
  const hits = new Map();
  return function rateLimit(req, res, next) {
    const now = Date.now();
    const batas = now - windowMs;
    const timestamps = (hits.get(req.ip) ?? []).filter((t) => t > batas);
    if (timestamps.length >= max) {
      return res.status(429).json({ success: false, message });
    }
    timestamps.push(now);
    hits.set(req.ip, timestamps);
    // Bersih-bersih oportunistik: buang IP yang sudah tanpa hit aktif
    // supaya Map tidak tumbuh tanpa batas.
    if (hits.size > 1000) {
      for (const [ip, ts] of hits) {
        if (ts.every((t) => t <= batas)) hits.delete(ip);
      }
    }
    next();
  };
}
