// src/controllers/sensor.controller.js
import * as service from '../services/sensor.service.js';

export async function listar(req, res) {
  try {
    const filtros = {
      leito_id: req.query.leito_id,
      status: req.query.status
    };

    const sensores = await service.listarSensores(filtros);
    res.json(sensores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar sensores' });
  }
}

export async function buscar(req, res) {
  try {
    const sensor = await service.buscarSensorPorId(req.params.id);
    if (!sensor) {
      return res.status(404).json({ erro: 'Sensor não encontrado' });
    }
    res.json(sensor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar sensor' });
  }
}

export async function criar(req, res) {
  try {
    const novo = await service.criarSensor(req.body);
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar sensor' });
  }
}

export async function atualizar(req, res) {
  try {
    const atualizado = await service.atualizarSensor(req.params.id, req.body);
    if (!atualizado) {
      return res.status(404).json({ erro: 'Sensor não encontrado' });
    }
    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar sensor' });
  }
}

export async function deletar(req, res) {
  try {
    await service.deletarSensor(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao deletar sensor' });
  }
}
