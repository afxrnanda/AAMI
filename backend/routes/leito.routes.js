import { Router } from 'express';
import * as LeitoController from '../controllers/leito.controller.js';

const router = Router();

router.get('/', LeitoController.listarLeitos);
router.get('/:id', LeitoController.buscarLeito);
router.post('/', LeitoController.criarLeito);
router.put('/:id', LeitoController.atualizarLeito);
router.delete('/:id', LeitoController.deletarLeito);

export default router;
