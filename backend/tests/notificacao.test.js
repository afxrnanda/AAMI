import {
  criarNotificacao,
  listarNotificacoes,
  marcarComoLida,
  limparNotificacoesAntigas,
  executarLimpezaAutomatica
} from '../services/notificacao.service.js';

import sql from '../supabase/db.js';

jest.mock('../supabase/db.js');

describe('Serviço de notificações', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar uma notificação', async () => {
    sql.mockResolvedValue([{ id: 1, titulo: 'Alerta', mensagem: 'Teste', tipo: 'aviso' }]);
    const dados = { leito_id: 1, titulo: 'Alerta', mensagem: 'Teste', tipo: 'aviso' };
    const result = await criarNotificacao(dados);
    expect(sql).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, titulo: 'Alerta', mensagem: 'Teste', tipo: 'aviso' });
  });

  it('deve listar notificações sem filtros', async () => {
    sql.unsafe.mockResolvedValue([{ id: 1, titulo: 'Notificação' }]);
    const result = await listarNotificacoes();
    expect(sql.unsafe).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM notificacoes'));
    expect(result).toEqual([{ id: 1, titulo: 'Notificação' }]);
  });

  it('deve listar notificações com filtros', async () => {
    sql.unsafe.mockResolvedValue([{ id: 2, titulo: 'Filtro' }]);
    const result = await listarNotificacoes({ lida: true, leito_id: 3 });
    expect(sql.unsafe).toHaveBeenCalledWith(expect.stringContaining('WHERE lida = true AND leito_id = 3'));
    expect(result).toEqual([{ id: 2, titulo: 'Filtro' }]);
  });

  it('deve marcar como lida', async () => {
    sql.mockResolvedValue([{ id: 1, lida: true }]);
    const result = await marcarComoLida(1);
    expect(sql).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, lida: true });
  });

  it('deve limpar notificações antigas', async () => {
    sql.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await limparNotificacoesAntigas();
    expect(sql).toHaveBeenCalled();
    expect(result.length).toBe(2);
  });

  it('deve executar limpeza automática e retornar quantidade removida', async () => {
    sql.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await executarLimpezaAutomatica();
    expect(result).toBe(2);
  });

  it('deve lançar erro na execução da limpeza automática', async () => {
    sql.mockRejectedValue(new Error('Erro no banco'));
    await expect(executarLimpezaAutomatica()).rejects.toThrow('Erro no banco');
  });
});
