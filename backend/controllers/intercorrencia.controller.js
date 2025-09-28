// src/controllers/intercorrencia.controller.js
import * as IntercorrenciaService from '../services/intercorrencia.service.js';

// Listar intercorrências com filtros
export async function listarIntercorrencias(req, res) {
  try {
    const filtros = {
      leito_id: req.query.leito_id ? parseInt(req.query.leito_id) : undefined,
      status: req.query.status,
    };

    const intercorrencias = await IntercorrenciaService.listarIntercorrencias(filtros);
    res.json(intercorrencias);
  } catch (error) {
    console.error('Erro ao listar intercorrências:', error);
    res.status(500).json({ mensagem: 'Falha ao listar intercorrências' });
  }
}

// Buscar intercorrência por ID
export async function buscarIntercorrencia(req, res) {
  try {
    const { id } = req.params;
    const intercorrencia = await IntercorrenciaService.buscarIntercorrenciaPorId(id);
    if (!intercorrencia) {
      return res.status(404).json({ mensagem: 'Intercorrência não encontrada' });
    }
    res.json(intercorrencia);
  } catch (error) {
    console.error('Erro ao buscar intercorrência:', error);
    res.status(500).json({ mensagem: 'Falha ao buscar intercorrência' });
  }
}

// Criar nova intercorrência
export async function criarIntercorrencia(req, res) {
  try {
    const data = req.body;
    const novaIntercorrencia = await IntercorrenciaService.criarIntercorrencia(data);
    res.status(201).json(novaIntercorrencia);
  } catch (error) {
    console.error('Erro ao criar intercorrência:', error);
    res.status(500).json({ mensagem: 'Falha ao criar intercorrência' });
  }
}

// Atualizar intercorrência existente
export async function atualizarIntercorrencia(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const intercorrenciaAtualizada = await IntercorrenciaService.atualizarIntercorrencia(id, data);
    if (!intercorrenciaAtualizada) {
      return res.status(404).json({ mensagem: 'Intercorrência não encontrada para atualização' });
    }
    res.json(intercorrenciaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar intercorrência:', error);
    res.status(500).json({ mensagem: 'Falha ao atualizar intercorrência' });
  }
}

// Deletar intercorrência
export async function deletarIntercorrencia(req, res) {
  try {
    const { id } = req.params;
    await IntercorrenciaService.deletarIntercorrencia(id);
    res.status(204).end();
  } catch (error) {
    console.error('Erro ao deletar intercorrência:', error);
    res.status(500).json({ mensagem: 'Falha ao deletar intercorrência' });
  }
}

// Limpar todas as intercorrências de um leito
export async function limparIntercorrenciasDoLeito(req, res) {
  try {
    const { leito_id } = req.params;
    await IntercorrenciaService.limparIntercorrenciasDoLeito(leito_id);
    res.status(204).end();
  } catch (error) {
    console.error('Erro ao limpar intercorrências do leito:', error);
    res.status(500).json({ mensagem: 'Falha ao limpar intercorrências do leito' });
  }
} 