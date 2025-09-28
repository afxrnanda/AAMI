import {
  listarLeitos,
  buscarLeitoPorId,
  criarLeito,
  atualizarLeito,
  deletarLeito
} from '../services/leito.service.js';

import sql from '../supabase/db.js';

jest.mock('../supabase/db.js');

describe('Serviço de leito', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve listar leitos', async () => {
    sql.unsafe.mockResolvedValue([{ leito_id: 1, codigo: 'L01' }]);
    const result = await listarLeitos();
    expect(sql.unsafe).toHaveBeenCalled();
    expect(result).toEqual([{ leito_id: 1, codigo: 'L01' }]);
  });

  it('deve buscar leito por ID', async () => {
    sql.mockResolvedValue([{ leito_id: 1, codigo: 'L02' }]);
    const result = await buscarLeitoPorId(1);
    expect(sql).toHaveBeenCalled();
    expect(result).toEqual({ leito_id: 1, codigo: 'L02' });
  });

  it('deve criar leito', async () => {
    sql.mockResolvedValue([{ leito_id: 1, codigo: 'L03' }]);
    const dados = { codigo: 'L03', tipo: 'UTI', setor: 'A' };
    const result = await criarLeito(dados);
    expect(sql).toHaveBeenCalled();
    expect(result).toEqual({ leito_id: 1, codigo: 'L03' });
  });

  it('deve atualizar leito', async () => {
    sql.unsafe.mockResolvedValue([{ leito_id: 1, codigo: 'L04' }]);
    const result = await atualizarLeito(1, { codigo: 'L04', tipo: 'Enfermaria' });
    expect(sql.unsafe).toHaveBeenCalled();
    expect(result.codigo).toBe('L04');
  });

  it('deve deletar leito', async () => {
    sql.mockResolvedValue([{ leito_id: 1 }]);
    const result = await deletarLeito(1);
    expect(sql).toHaveBeenCalled();
    expect(result).toEqual({ leito_id: 1 });
  });
});
