import * as NotificacaoService from '../services/notificacao.service.js';

export async function criar(req, res) {
  try {
    const nova = await NotificacaoService.criarNotificacao(req.body);
    res.status(201).json(nova);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar notificação' });
  }
}

export async function listar(req, res) {
  try {
    const notificacoes = await NotificacaoService.listarNotificacoes(req.query);
    res.json(notificacoes);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar notificações' });
  }
}

export async function marcarComoLida(req, res) {
  try {
    const not = await NotificacaoService.marcarComoLida(req.params.id);
    res.json(not);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao marcar como lida' });
  }
}

export async function limparAntigas(req, res) {
  try {
    const removidas = await NotificacaoService.limparNotificacoesAntigas();
    res.json({ mensagem: `${removidas.length} notificações antigas removidas` });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao limpar notificações antigas' });
  }
} 