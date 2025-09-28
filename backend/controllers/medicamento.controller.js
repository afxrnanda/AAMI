// src/controllers/medicamento.controller.js
import * as service from '../services/medicamento.service.js';

export async function listar(req, res) {
  try {
    const medicamentos = await service.listarMedicamentos();
    res.json(medicamentos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar medicamentos' });
  }
}

export async function buscar(req, res) {
  try {
    const medicamento = await service.buscarMedicamentoPorId(req.params.id);
    if (!medicamento) {
      return res.status(404).json({ erro: 'Medicamento não encontrado' });
    }
    res.json(medicamento);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar medicamento' });
  }
}

export async function criar(req, res) {
  try {
    const novo = await service.criarMedicamento(req.body);
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar medicamento' });
  }
}

export async function atualizar(req, res) {
  try {
    const atualizado = await service.atualizarMedicamento(req.params.id, req.body);
    if (!atualizado) {
      return res.status(404).json({ erro: 'Medicamento não encontrado' });
    }
    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar medicamento' });
  }
}

export async function deletar(req, res) {
  try {
    await service.deletarMedicamento(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao deletar medicamento' });
  }
}
