import { Router } from 'express';
import * as ctrl from '../controllers/users.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Semua manajemen user hanya untuk admin.
// Pembuatan akun admin/tim_lapangan lewat sini; warga daftar via /api/auth/register.
router.use(authenticate, authorize('admin'));

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.register);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
