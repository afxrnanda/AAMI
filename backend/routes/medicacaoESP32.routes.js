import express from 'express';
import { finalizarPorLeito } from '../controllers/medicacao.controller.js';

const router = express.Router();

// Rota pública para o ESP32 finalizar a medicação
router.put('/finalizar/leito/:leito_id', finalizarPorLeito);

export default router;
