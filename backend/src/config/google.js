// Verifikasi ID token Google (Google Sign-In) memakai library resmi
// google-auth-library. Dipisah ke modul ini supaya controller tetap
// tipis — dan supaya verifikasinya bisa diganti stub saat tes e2e:
// token Google asli tidak bisa dipalsukan (signature dicek ke
// sertifikat Google), jadi di tes, googleAuth.verifyIdToken diganti
// dengan fungsi palsu yang mengembalikan payload yang sama bentuknya.
// Jalur produksi selalu memakai library asli di bawah ini.
import { OAuth2Client } from 'google-auth-library';

export const googleAuth = {
  async verifyIdToken(idToken) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID belum diisi di file .env');
    }
    const client = new OAuth2Client(clientId);
    // Cek signature + audience (harus = Client ID aplikasi) + masa berlaku.
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    return ticket.getPayload();
  },
};
