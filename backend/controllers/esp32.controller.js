import * as LeitoService from '../../backend/services/leito.service.js';
import { iniciarAplicacaoViaLeito } from '../services/medicacao.service.js';
import { criarNotificacao } from '../services/notificacao.service.js';

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

    // Lógica de status com base no peso
    let novoStatus = leitoAtual.status_gotejamento;
    if (peso_atual_g === 0) {
      novoStatus = 'finalizado';
    } else if (peso_inicial_g > 0) {
      const percentual = peso_atual_g / peso_inicial_g;
      if (percentual < 0.1) novoStatus = 'finalizado';
      else if (percentual < 0.3) novoStatus = 'alerta';
      else novoStatus = 'em-andamento';
    } else {
      novoStatus = 'nenhum';
    }

    // Calcular taxa de gotejamento e tempo restante
    let taxaGotejamentoGS = null;
    let tempoRestanteMinutos = null;
    let previsaoTerminoCalculada = null;

    if (leitoAtual.inicio_medicacao && peso_inicial_g > 0 && peso_atual_g > 0) {
      const inicioMedicacao = new Date(leitoAtual.inicio_medicacao);
      const agora = new Date();
      const tempoDecorridoSegundos = (agora - inicioMedicacao) / 1000;
      
      // Validações adicionais para evitar erros de cálculo
      if (tempoDecorridoSegundos > 0) {
        const pesoConsumido = peso_inicial_g - peso_atual_g;
        
        if (pesoConsumido > 0) {
          // Taxa em gramas por segundo
          taxaGotejamentoGS = pesoConsumido / tempoDecorridoSegundos;
          
          // Validar se a taxa é válida
          if (taxaGotejamentoGS > 0 && isFinite(taxaGotejamentoGS)) {
            // Tempo restante em segundos
            const tempoRestanteSegundos = peso_atual_g / taxaGotejamentoGS;
            
            // Validar se o tempo restante é razoável
            if (tempoRestanteSegundos > 0 && isFinite(tempoRestanteSegundos) && tempoRestanteSegundos < 24 * 60 * 60) {
              tempoRestanteMinutos = Math.round(tempoRestanteSegundos / 60);
              
              // Previsão de término calculada
              previsaoTerminoCalculada = new Date(agora.getTime() + (tempoRestanteSegundos * 1000));
            }
          }
        }
      }
    }

    const dadosAtualizacao = {
      peso_inicial_g,
      peso_atual_g,
      status_gotejamento: novoStatus,
      taxa_gotejamento_gs: taxaGotejamentoGS,
      tempo_restante_minutos: tempoRestanteMinutos,
      previsao_termino_calculada: previsaoTerminoCalculada
    };

    const leitoAtualizado = await LeitoService.atualizarLeito(id, dadosAtualizacao);

    return res.json(leitoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar peso do leito (ESP32):', error);
    return res.status(500).json({ mensagem: 'Erro ao atualizar peso do leito' });
  }
}

export async function iniciarMedicacaoEsp32(req, res) {
  try {
    const { id } = req.params;
    const { 
      medicamento_atual = 'Soro Fisiológico 500ml',
      volume_ml = 500,
      dosagem_mg = 0,
      fluxo_ml_h = 125,
      peso_inicial_g,
      observacoes = 'Iniciado via ESP32'
    } = req.body;

    const leitoAtual = await LeitoService.buscarLeitoPorId(id);
    if (!leitoAtual) {
      return res.status(404).json({ mensagem: 'Leito não encontrado' });
    }

    if (leitoAtual.ocupado) {
      return res.status(400).json({ mensagem: `Leito ${leitoAtual.codigo} já está ocupado. Finalize a medicação anterior ou escolha outro leito.` });
    }

    if (!peso_inicial_g || peso_inicial_g <= 0) {
      return res.status(400).json({ mensagem: 'peso_inicial_g é obrigatório e deve ser maior que 0' });
    }

    // Centraliza o ciclo de medicação em medicacao_aplicada + estado do leito
    const leitoAtualizado = await iniciarAplicacaoViaLeito(Number(id), {
      volume_ml,
      dosagem_mg,
      fluxo_ml_h,
      peso_inicial_g,
      observacoes,
      // Paciente/medicamento podem ser vinculados depois (opcionais)
    });

    // Mantém o campo "medicamento_atual" no leito para UI (opcional)
    await LeitoService.atualizarLeito(Number(id), { medicamento_atual });

    // Notificação amigável
    try {
      await criarNotificacao({
        leito_id: leitoAtual.leito_id,
        titulo: 'Medicação Iniciada',
        mensagem: `Nova medicação iniciada no leito ${leitoAtual.codigo}.`,
        tipo: 'info'
      });
    } catch (e) {
      console.warn('Falha ao criar notificação de início (ESP32):', e?.message);
    }

    return res.json({
      mensagem: 'Medicação iniciada com sucesso via ESP32',
      leito: leitoAtualizado
    });
  } catch (error) {
    console.error('Erro ao iniciar medicação via ESP32:', error);
    return res.status(500).json({ mensagem: 'Erro ao iniciar medicação' });
  }
}