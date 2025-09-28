// src/controllers/manutencao.controller.js
import * as service from '../services/manutencao.service.js';

export async function listar(req, res) {
  try {
    const filtros = {
      leito_id: req.query.leito_id,
      status: req.query.status
    };

    const manutencoes = await service.listarManutencoes(filtros);
    res.json(manutencoes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar manutenções' });
  }
}

export async function buscar(req, res) {
  try {
    const manutencao = await service.buscarManutencaoPorId(req.params.id);
    if (!manutencao) {
      return res.status(404).json({ erro: 'Manutenção não encontrada' });
    }
    res.json(manutencao);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar manutenção' });
  }
}

export async function agendar(req, res) {
  try {
    const nova = await service.agendarManutencao(req.body);
    res.status(201).json(nova);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao agendar manutenção' });
  }
}

export async function concluir(req, res) {
  try {
    const concluida = await service.concluirManutencao(req.params.id, req.body);
    if (!concluida) {
      return res.status(404).json({ erro: 'Manutenção não encontrada' });
    }
    res.json(concluida);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao concluir manutenção' });
  }
}

export async function deletar(req, res) {
  try {
    await service.deletarManutencao(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao deletar manutenção' });
  }
}
