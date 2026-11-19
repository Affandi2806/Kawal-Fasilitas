import { createApp } from '../src/app.js';

// Pintu masuk serverless untuk Vercel (issue #32).
// Vercel memanggil aplikasi Express ini sebagai handler fungsi serverless.
// server.js tetap dipakai untuk jalan lokal (npm run dev / npm start).
const app = createApp();

export default app;
