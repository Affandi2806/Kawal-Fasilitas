import { Router } from 'express';
import * as ctrl from '../controllers/perbaikan.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
// Disposisi tugas ke tim lapangan: hanya admin
router.post('/', authorize('admin'), ctrl.create);
// Update progres perbaikan: admin & tim lapangan
router.patch('/:id', authorize('admin', 'tim_lapangan'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

export default router;
