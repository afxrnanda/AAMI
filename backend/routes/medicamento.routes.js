// src/routes/medicamento.routes.js
import express from 'express';
import * as controller from '../controllers/medicamento.controller.js';

const router = express.Router();

router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

export default router;
