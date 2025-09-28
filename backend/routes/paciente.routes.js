// src/routes/paciente.routes.js
import express from 'express';
import * as controller from '../controllers/paciente.controller.js';

const router = express.Router();

router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.get('/documento/:doc', controller.buscarPorDocumento);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

export default router;
