import { Router } from 'express';
import * as ctrl from '../controllers/tugas.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { uploadFoto } from '../middlewares/upload.js';

const router = Router();

router.use(authenticate);

// Tugas aktif satu teknisi: admin boleh lihat siapa saja,
// tim_lapangan hanya tugasnya sendiri (dicek di controller).
router.get('/:tim_id', authorize('admin', 'tim_lapangan'), ctrl.getTugasAktif);
// Laporkan penyelesaian: teknisi yang ditugaskan atau admin.
// Foto after dikirim sebagai file field "foto_after".
router.put('/:id/selesai', authorize('admin', 'tim_lapangan'), uploadFoto('foto_after'), ctrl.selesaikanTugas);

export default router;
