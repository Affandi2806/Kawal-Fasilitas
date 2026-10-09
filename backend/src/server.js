import 'dotenv/config';
import { createApp } from './app.js';

const PORT = process.env.PORT || 3000;

const app = createApp();
app.listen(PORT, () => {
  console.log(`[Kawal-Fasilitas] server berjalan di http://localhost:${PORT}`);
});
