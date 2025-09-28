// src/controllers/medicacao.controller.js
import * as service from '../services/medicacao.service.js';

export async function listar(req, res) {
  try {
    const filtros = {
      paciente_id: req.query.paciente_id,
      status: req.query.status,
      aplicado_por: req.query.aplicado_por
    };

    const aplicacoes = await service.listarAplicacoes(filtros);
    res.json(aplicacoes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar aplicações' });
  }
}

export async function buscar(req, res) {
  try {
    const aplicacao = await service.buscarAplicacaoPorId(req.params.id);
    if (!aplicacao) {
      return res.status(404).json({ erro: 'Aplicação não encontrada' });
    }
    res.json(aplicacao);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar aplicação' });
  }
}

export async function criar(req, res) {
  try {
    const nova = await service.criarAplicacao(req.body);
    res.status(201).json(nova);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar aplicação' });
  }
}

export async function atualizar(req, res) {
  try {
    const atualizada = await service.atualizarAplicacao(req.params.id, req.body);
    if (!atualizada) {
      return res.status(404).json({ erro: 'Aplicação não encontrada' });
    }
    res.json(atualizada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar aplicação' });
  }
}

export async function deletar(req, res) {
  try {
    await service.deletarAplicacao(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao deletar aplicação' });
  }
}

export async function finalizarPorLeito(req, res) {
  try {
    const { leito_id } = req.params;

    const resultado = await service.finalizarAplicacaoPorLeito(leito_id);
    if (!resultado) {
      return res.status(404).json({ mensagem: 'Nenhuma medicação ativa encontrada para esse leito.' });
    }

    res.json({
      mensagem: 'Medicação finalizada com sucesso e leito liberado.',
      ...resultado
    });
  } catch (error) {
    console.error('Erro ao finalizar aplicação por leito:', error);
    res.status(500).json({ mensagem: 'Erro ao finalizar aplicação' });
  }
}
