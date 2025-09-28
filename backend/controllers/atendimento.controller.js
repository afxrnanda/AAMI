import * as AtendimentoService from '../services/atendimento.service.js';

export async function criar(req, res) {
  try {
    const dados = req.body;
    const atendimento = await AtendimentoService.criarAtendimento(dados);
    res.status(201).json(atendimento);
  } catch (error) {
    console.error('Erro ao criar atendimento:', error);
    res.status(500).json({ mensagem: 'Falha ao criar atendimento' });
  }
}

export async function listar(req, res) {
  try {
    const filtros = {
      leito_id: req.query.leito_id,
      paciente_id: req.query.paciente_id,
      profissional_id: req.query.profissional_id,
      tipo_atendimento: req.query.tipo_atendimento
    };

    const atendimentos = await AtendimentoService.listarAtendimentos(filtros);
    res.json(atendimentos);
  } catch (error) {
    console.error('Erro ao listar atendimentos:', error);
    res.status(500).json({ mensagem: 'Falha ao listar atendimentos' });
  }
}

export async function buscar(req, res) {
  try {
    const { id } = req.params;
    const atendimento = await AtendimentoService.buscarAtendimentoPorId(id);
    
    if (!atendimento) {
      return res.status(404).json({ mensagem: 'Atendimento não encontrado' });
    }
    
    res.json(atendimento);
  } catch (error) {
    console.error('Erro ao buscar atendimento:', error);
    res.status(500).json({ mensagem: 'Falha ao buscar atendimento' });
  }
}

export async function finalizar(req, res) {
  try {
    const { id } = req.params;
    const dados = req.body;
    
    const atendimento = await AtendimentoService.finalizarAtendimento(id, dados);
    
    if (!atendimento) {
      return res.status(404).json({ mensagem: 'Atendimento não encontrado' });
    }
    
    res.json(atendimento);
  } catch (error) {
    console.error('Erro ao finalizar atendimento:', error);
    res.status(500).json({ mensagem: 'Falha ao finalizar atendimento' });
  }
}