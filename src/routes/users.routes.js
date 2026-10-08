import { Router } from 'express';
import * as ctrl from '../controllers/users.controller.js';

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.register);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
