import { Router } from 'express';
import * as LeitoController from '../controllers/leito.controller.js';
import * as Esp32Controller from '../controllers/esp32.controller.js';

const router = Router();

// PUT público para atualizar peso do leito pelo ESP32 (sem requireAuth)
router.put('/:id', LeitoController.atualizarPesoLeitoEsp32);
router.get('/:id', LeitoController.buscarLeitoPorIdEsp32);

// POST público para iniciar medicação via ESP32 (sem requireAuth)
router.post('/:id/iniciar-medicacao', Esp32Controller.iniciarMedicacaoEsp32);

export default router;
