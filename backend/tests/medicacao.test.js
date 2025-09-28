import {
  listarAplicacoes,
  buscarAplicacaoPorId,
  criarAplicacao,
  atualizarAplicacao,
  deletarAplicacao,
  iniciarAplicacaoViaLeito,
  finalizarAplicacaoPorLeito
} from '../services/medicacao.js';

import sql from '../supabase/db.js';

jest.mock('../supabase/db.js');

describe('Serviço de medicação', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve listar aplicações com filtros', async () => {
    sql.unsafe.mockResolvedValue([{ aplicacao_id: 1 }]);
    const result = await listarAplicacoes({ paciente_id: 1 });
    expect(sql.unsafe).toHaveBeenCalled();
    expect(result).toEqual([{ aplicacao_id: 1 }]);
  });

  it('deve buscar aplicação por ID', async () => {
    sql.mockResolvedValue([{ aplicacao_id: 1 }]);
    const result = await buscarAplicacaoPorId(1);
    expect(sql).toHaveBeenCalled();
    expect(result).toEqual({ aplicacao_id: 1 });
  });

  it('deve criar aplicação', async () => {
    sql.mockResolvedValue([{ aplicacao_id: 1 }]);
    const dados = { paciente_id: 1, medicamento_id: 1, volume_ml: 50 };
    const result = await criarAplicacao(dados);
    expect(sql).toHaveBeenCalled();
    expect(result).toEqual({ aplicacao_id: 1 });
  });

  it('deve atualizar aplicação', async () => {
    sql.mockResolvedValue([{ aplicacao_id: 1, status: 'finalizado' }]);
    const result = await atualizarAplicacao(1, { status: 'finalizado' });
    expect(sql).toHaveBeenCalled();
    expect(result.status).toBe('finalizado');
  });

  it('deve deletar aplicação', async () => {
    sql.mockResolvedValue([]);
    await deletarAplicacao(1);
    expect(sql).toHaveBeenCalled();
  });

  it('deve iniciar aplicação via leito', async () => {
    sql.begin.mockImplementation(async (cb) => cb(sql));
    sql.mockResolvedValue([{ leito_id: 1 }]);
    const result = await iniciarAplicacaoViaLeito(1, { volume_ml: 100, fluxo_ml_h: 50 });
    expect(sql.begin).toHaveBeenCalled();
    expect(result).toEqual({ leito_id: 1 });
  });

  it('deve finalizar aplicação por leito', async () => {
    sql.mockResolvedValueOnce([{ aplicacao_id: 1, paciente_id: 2 }]); // busca aplicação
    sql.begin.mockImplementation(async (cb) => cb(sql));
    const result = await finalizarAplicacaoPorLeito(1);
    expect(sql.begin).toHaveBeenCalled();
    expect(result.aplicacao_id).toBe(1);
    expect(result.fallback).toBe(false);
  });

  it('deve finalizar aplicação por leito', async () => {
    sql.mockResolvedValueOnce([]); 
    sql.mockResolvedValueOnce([]); 
    sql.begin.mockImplementation(async (cb) => cb(sql));
    const result = await finalizarAplicacaoPorLeito(1);
    expect(result.fallback).toBe(true);
  });
});
