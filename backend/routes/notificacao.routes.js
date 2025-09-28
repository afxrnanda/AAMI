import { Router } from 'express';
import * as NotificacaoController from '../controllers/notificacao.controller.js';

const router = Router();

router.post('/', NotificacaoController.criar);
router.get('/', NotificacaoController.listar);
router.put('/:id/lida', NotificacaoController.marcarComoLida);
router.delete('/limpar-antigas', NotificacaoController.limparAntigas);

export default router; 