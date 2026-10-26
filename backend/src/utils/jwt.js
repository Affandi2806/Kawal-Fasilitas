import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!SECRET) {
  throw new Error('JWT_SECRET wajib diisi di file .env');
}

// Payload minimal: sub (user id) + role. Jangan taruh data sensitif.
export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, SECRET, {
    expiresIn: EXPIRES_IN,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
