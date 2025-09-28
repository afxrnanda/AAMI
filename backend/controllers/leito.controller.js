// src/controllers/leito.controller.js
import * as LeitoService from '../services/leito.service.js';
import { criarNotificacao } from '../services/notificacao.service.js';

// Listar todos os leitos
export async function listarLeitos(req, res) {
  try {
    const filtros = {
      setor: req.query.setor,
      ocupado: req.query.ocupado !== undefined ? req.query.ocupado === 'true' : undefined,
      em_manutencao: req.query.em_manutencao !== undefined ? req.query.em_manutencao === 'true' : undefined,
      status_gotejamento: req.query.status_gotejamento,
    };

    const leitos = await LeitoService.listarLeitos(filtros);
    res.json(leitos);
  } catch (error) {
    console.error('Erro ao listar leitos:', error);
    res.status(500).json({ mensagem: 'Falha ao listar leitos' });
  }
}


// Buscar leito por ID
export async function buscarLeito(req, res) {
  try {
    const { id } = req.params;
    const leito = await LeitoService.buscarLeitoPorId(id);
    if (!leito) {
      return res.status(404).json({ mensagem: 'Leito não encontrado' });
    }
    res.json(leito);
  } catch (error) {
    console.error('Erro ao buscar leito:', error);
    res.status(500).json({ mensagem: 'Falha ao buscar leito' });
  }
}

// Criar novo leito
export async function criarLeito(req, res) {
  try {
    const data = req.body;
    const novoLeito = await LeitoService.criarLeito(data);
    res.status(201).json(novoLeito);
  } catch (error) {
    console.error('Erro ao criar leito:', error);
    res.status(500).json({ mensagem: 'Falha ao criar leito' });
  }
}

// Atualizar leito existente
export async function atualizarLeito(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const leitoAtual = await LeitoService.buscarLeitoPorId(id);
    const leitoAtualizado = await LeitoService.atualizarLeito(id, data);
    if (!leitoAtualizado) {
      return res.status(404).json({ mensagem: 'Leito não encontrado para atualização' });
    }
    // Gatilho de notificação para mudança de status
    if (data.status_gotejamento && data.status_gotejamento !== leitoAtual.status_gotejamento) {
      let titulo, mensagem, tipo;
      switch (data.status_gotejamento) {
        case 'alerta':
          titulo = 'Alerta de Leito';
          mensagem = `O leito ${leitoAtual.codigo} entrou em estado de alerta.`;
          tipo = 'alerta';
          break;
        case 'finalizado':
          titulo = 'Medicação Finalizada';
          mensagem = `A medicação do leito ${leitoAtual.codigo} foi finalizada.`;
          tipo = 'sucesso';
          break;
        case 'em-andamento':
          titulo = 'Medicação Iniciada';
          mensagem = `Nova medicação iniciada no leito ${leitoAtual.codigo}.`;
          tipo = 'info';
          break;
        case 'pausado':
          titulo = 'Medicação Pausada';
          mensagem = `A medicação do leito ${leitoAtual.codigo} foi pausada.`;
          tipo = 'info';
          break;
        default:
          titulo = 'Status do Leito Alterado';
          mensagem = `O status do leito ${leitoAtual.codigo} foi alterado.`;
          tipo = 'info';
      }
      await criarNotificacao({
        leito_id: leitoAtual.leito_id,
        titulo,
        mensagem,
        tipo
      });
    }
    res.json(leitoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar leito:', error);
    res.status(500).json({ mensagem: 'Falha ao atualizar leito' });
  }
}

// Deletar leito
export async function deletarLeito(req, res) {
  try {
    const { id } = req.params;
    await LeitoService.deletarLeito(id);
    res.status(204).end();
  } catch (error) {
    console.error('Erro ao deletar leito:', error);
    res.status(500).json({ mensagem: 'Falha ao deletar leito' });
  }
}

export async function atualizarPesoLeitoEsp32(req, res) {
  try {
    const { id } = req.params;
    const { peso_inicial_g, peso_atual_g } = req.body;

    if (peso_inicial_g === undefined || peso_atual_g === undefined) {
      return res.status(400).json({ mensagem: 'peso_inicial_g e peso_atual_g são obrigatórios' });
    }

    const leitoAtual = await LeitoService.buscarLeitoPorId(id);
    if (!leitoAtual) {
      return res.status(404).json({ mensagem: 'Leito não encontrado' });
    }

    // --- Lógica de status baseada no peso ---
    let novoStatus = leitoAtual.status_gotejamento;

    if (peso_atual_g === 0) {
      novoStatus = 'finalizado';
    } else if (peso_inicial_g > 0) {
      const percentual = peso_atual_g / peso_inicial_g;

      if (percentual < 0.1) {
        novoStatus = 'finalizado'; // ou 'alerta' se preferir
      } else if (percentual < 0.3) {
        novoStatus = 'alerta';
      } else {
        novoStatus = 'em-andamento';
      }
    } else {
      novoStatus = 'nenhum'; // fallback seguro
    }

    const leitoAtualizado = await LeitoService.atualizarLeito(id, {
      peso_inicial_g,
      peso_atual_g,
      status_gotejamento: novoStatus,
    });

    return res.json(leitoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar peso do leito (ESP32):', error);
    return res.status(500).json({ mensagem: 'Erro ao atualizar peso do leito' });
  }
}


export async function buscarLeitoPorIdEsp32(req, res) {
  try {
    const { id } = req.params;
    const leito = await LeitoService.buscarLeitoPorId(id);
    if (!leito) {
      return res.status(404).json({ mensagem: 'Leito não encontrado' });
    }
    res.json(leito);
  } catch (error) {
    console.error('Erro ao buscar leito ESP32:', error);
    res.status(500).json({ mensagem: 'Falha ao buscar leito' });
  }
}
