import { Router } from 'express';
import * as AtendimentoController from '../controllers/atendimento.controller.js';

const router = Router();

router.post('/', AtendimentoController.criar);
router.get('/', AtendimentoController.listar);
router.get('/:id', AtendimentoController.buscar);
router.put('/:id/finalizar', AtendimentoController.finalizar);

export default router;