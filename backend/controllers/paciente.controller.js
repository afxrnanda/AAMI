// src/controllers/paciente.controller.js
import * as service from '../services/paciente.service.js';

export async function listar(req, res) {
  try {
    const pacientes = await service.listarPacientes();
    res.json(pacientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar pacientes' });
  }
}

export async function buscar(req, res) {
  try {
    const paciente = await service.buscarPacientePorId(req.params.id);
    if (!paciente) {
      return res.status(404).json({ erro: 'Paciente não encontrado' });
    }
    res.json(paciente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar paciente' });
  }
}

export async function buscarPorDocumento(req, res) {
  try {
    const paciente = await service.buscarPacientePorDocumento(req.params.doc);
    if (!paciente) {
      return res.status(404).json({ erro: 'Paciente não encontrado' });
    }
    res.json(paciente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar paciente' });
  }
}

export async function criar(req, res) {
  try {
    const novo = await service.criarPaciente(req.body);
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar paciente' });
  }
}

export async function atualizar(req, res) {
  try {
    const atualizado = await service.atualizarPaciente(req.params.id, req.body);
    if (!atualizado) {
      return res.status(404).json({ erro: 'Paciente não encontrado' });
    }
    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar paciente' });
  }
}

export async function deletar(req, res) {
  try {
    await service.deletarPaciente(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao deletar paciente' });
  }
}
