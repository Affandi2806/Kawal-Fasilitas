import { Router } from 'express';
import * as ctrl from '../controllers/laporan.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create); // user_id diambil dari token, bukan body
router.patch('/:id', authorize('admin', 'tim_lapangan'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

export default router;
