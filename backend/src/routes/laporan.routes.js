import { Router } from 'express';
import * as ctrl from '../controllers/laporan.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { uploadFoto } from '../middlewares/upload.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getAll);
// Daftarkan SEBELUM /:id — kalau tidak, "warga" ditangkap sebagai :id.
router.get('/warga/:id', ctrl.getByWarga);
router.get('/:id', ctrl.getOne);
router.post('/', uploadFoto, ctrl.create); // user_id diambil dari token, bukan body
router.patch('/:id', authorize('admin', 'tim_lapangan'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

export default router;
