// src/routes/intercorrencia.routes.js
import { Router } from 'express';
import * as IntercorrenciaController from '../controllers/intercorrencia.controller.js';

const router = Router();

// Rotas básicas CRUD
router.get('/', IntercorrenciaController.listarIntercorrencias);
router.get('/:id', IntercorrenciaController.buscarIntercorrencia);
router.post('/', IntercorrenciaController.criarIntercorrencia);
router.put('/:id', IntercorrenciaController.atualizarIntercorrencia);
router.delete('/:id', IntercorrenciaController.deletarIntercorrencia);

// Rota específica para limpar intercorrências de um leito
router.delete('/leito/:leito_id', IntercorrenciaController.limparIntercorrenciasDoLeito);

export default router; 