import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import usersRoutes from './routes/users.routes.js';
import laporanRoutes from './routes/laporan.routes.js';
import perbaikanRoutes from './routes/perbaikan.routes.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) =>
    res.json({ success: true, message: 'Kawal Fasilitas API berjalan' })
  );

  app.use('/api/users', usersRoutes);
  app.use('/api/laporan', laporanRoutes);
  app.use('/api/perbaikan', perbaikanRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
