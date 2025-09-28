import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000';

async function authenticatedRequest(endpoint: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

// Tipos
export type LeitoMonitoramento = {
  tempo_ocioso_segundos: null;
  leito_id: number;
  codigo: string;
  ocupado: boolean;
  medicamento_atual?: string;
  volume_ml?: number;
  dosagem_mg?: number;
  inicio_medicacao?: string;
  previsao_termino?: string;
  peso_inicial_g?: number;
  peso_atual_g?: number;
  fluxo_ml_h?: number;
  status_gotejamento: 'em-andamento' | 'pausado' | 'finalizado' | 'alerta' | 'nenhum';
  em_manutencao?: boolean;
};

export type Intercorrencia = {
  id: number;
  leito_id: number;
  descricao: string;
  data_registro: string;
  status: string;
};

export type DadosNovaMedicacao = {
  medicamento_atual: string;
  volume_ml: number;
  dosagem_mg: number;
  fluxo_ml_h: number;
  peso_inicial_g: number;
  observacoes?: string;
};

export type DadosNovaMedicacaoSimplificada = {
  peso_inicial_g?: number;
  observacoes?: string;
};

// Funções da API

// Buscar todos os leitos
export async function buscarLeitos(): Promise<LeitoMonitoramento[]> {
  return authenticatedRequest('/leitos');
}

// Buscar leito específico por ID
export async function buscarLeitoPorId(leitoId: number): Promise<LeitoMonitoramento> {
  return authenticatedRequest(`/leitos/${leitoId}`);
}

// Buscar intercorrências de um leito
export async function buscarIntercorrenciasPorLeito(leitoId: number): Promise<Intercorrencia[]> {
  return authenticatedRequest(`/intercorrencias?leito_id=${leitoId}`);
}

// Registrar nova intercorrência
export async function registrarIntercorrencia(leito_id: number, descricao: string): Promise<Intercorrencia> {
  return authenticatedRequest('/intercorrencias', {
    method: 'POST',
    body: JSON.stringify({
      leito_id,
      descricao,
    }),
  });
}

export async function iniciarNovaMedicacao(
leitoId: number,
dados: DadosNovaMedicacao
): Promise<{ success: boolean; data?: LeitoMonitoramento; error?: string }> {
try {
  // Calcular previsão de término baseada no fluxo e volume
  let previsaoTermino: Date;
  
  if (dados.fluxo_ml_h > 0 && dados.volume_ml > 0) {
    // Cálculo baseado no fluxo configurado (mais preciso)
    const tempoEstimadoHoras = dados.volume_ml / dados.fluxo_ml_h;
    previsaoTermino = new Date(Date.now() + tempoEstimadoHoras * 60 * 60 * 1000);
  } else {
    // Fallback para cálculo baseado no peso (se disponível)
    if (dados.peso_inicial_g && dados.peso_inicial_g > 0) {
      // Estimativa baseada em taxa média de consumo
      const taxaEstimadaGS = 0.1; // 0.1g por segundo (estimativa conservadora)
      const tempoEstimadoMs = dados.peso_inicial_g / taxaEstimadaGS;
      previsaoTermino = new Date(Date.now() + tempoEstimadoMs);
    } else {
      // Fallback para 4 horas se não houver dados suficientes
      previsaoTermino = new Date(Date.now() + 4 * 60 * 60 * 1000);
    }
  }

  const dadosCompletos = {
    medicamento_atual: dados.medicamento_atual || '',
    volume_ml: dados.volume_ml || 0,
    dosagem_mg: dados.dosagem_mg || 0,
    fluxo_ml_h: dados.fluxo_ml_h || 0,
    peso_inicial_g: dados.peso_inicial_g || 0,
    ocupado: true,
    peso_atual_g: dados.peso_inicial_g || 0,
    inicio_medicacao: new Date().toISOString(),
    previsao_termino: previsaoTermino.toISOString(),
    status_gotejamento: 'em-andamento',
    observacoes: dados.observacoes || ''
  };

  const response = await authenticatedRequest(`/leitos/${leitoId}`, {
    method: 'PUT',
    body: JSON.stringify(dadosCompletos),
  });

  let leitoAtualizado: LeitoMonitoramento | undefined = undefined;

  if (response === null) {
    leitoAtualizado = await buscarLeitoPorId(leitoId);
  } else {
    leitoAtualizado = response as LeitoMonitoramento;
  }

  // Limpa intercorrências após iniciar
  try {
    await limparIntercorrenciasDoLeito(leitoId);
  } catch (e) {
    console.warn('Falha ao limpar intercorrências após início:', (e as any)?.message);
  }

  // Limpa tempo ocioso após iniciar
  try {
    await limparTempoOciosoDoLeito(leitoId);
  } catch (e) {
    console.warn('Falha ao limpar tempo ocioso após início:', (e as any)?.message);
  }

  return { success: true, data: leitoAtualizado };
} catch (error: any) {
  return { 
    success: false, 
    error: error?.message || 'Erro inesperado ao iniciar medicação' 
  };
}
}

// Pausar/Retomar medicação
export async function alterarStatusMedicacao(leitoId: number, novoStatus: 'em-andamento' | 'pausado'): Promise<LeitoMonitoramento> {
  return authenticatedRequest(`/leitos/${leitoId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status_gotejamento: novoStatus,
    }),
  });
}

// Limpar intercorrências de um leito (chamado quando inicia nova medicação)
export async function limparIntercorrenciasDoLeito(leitoId: number): Promise<void> {
  await authenticatedRequest(`/intercorrencias/leito/${leitoId}`, {
    method: 'DELETE',
  });
}

// Limpar tempo ocioso de um leito (chamado quando inicia nova medicação)
export async function limparTempoOciosoDoLeito(leitoId: number): Promise<void> {
  await authenticatedRequest(`/leitos/${leitoId}`, {
    method: 'PUT',
    body: JSON.stringify({
      tempo_ocioso_segundos: null
    }),
  });
}

// Notificações
export interface Notificacao {
  id: number;
  leito_id: number;
  titulo: string;
  mensagem: string;
  tipo: 'alerta' | 'info' | 'sucesso' | 'erro';
  data: string;
  lida: boolean;
}

export async function buscarNotificacoes(filtros?: { lida?: boolean; leito_id?: number }): Promise<Notificacao[]> {
  const params = new URLSearchParams();
  if (filtros?.lida !== undefined) params.append('lida', filtros.lida.toString());
  if (filtros?.leito_id !== undefined) params.append('leito_id', filtros.leito_id.toString());
  
  return authenticatedRequest(`/notificacoes?${params.toString()}`);
}

export async function marcarNotificacaoComoLida(id: number): Promise<Notificacao> {
  return authenticatedRequest(`/notificacoes/${id}/lida`, {
    method: 'PUT',
  });
} 