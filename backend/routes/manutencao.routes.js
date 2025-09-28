// src/routes/manutencao.routes.js
import express from 'express';
import * as controller from '../controllers/manutencao.controller.js';

const router = express.Router();

router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.post('/', controller.agendar);
router.put('/:id', controller.concluir);
router.delete('/:id', controller.deletar);

export default router;
