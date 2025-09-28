import {
  listarMedicamentos,
  buscarMedicamentoPorId,
  criarMedicamento,
  atualizarMedicamento,
  deletarMedicamento
} from '../services/medicamento.service.js';

import sql from '../supabase/db.js';

jest.mock('../supabase/db.js');

describe('Serviço de medicamento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve listar medicamentos', async () => {
    sql.mockResolvedValue([{ medicamento_id: 1, nome: 'Paracetamol' }]);
    const result = await listarMedicamentos();
    expect(sql).toHaveBeenCalled();
    expect(result).toEqual([{ medicamento_id: 1, nome: 'Paracetamol' }]);
  });

  it('deve buscar medicamento por ID', async () => {
    sql.mockResolvedValue([{ medicamento_id: 1, nome: 'Ibuprofeno' }]);
    const result = await buscarMedicamentoPorId(1);
    expect(sql).toHaveBeenCalled();
    expect(result).toEqual({ medicamento_id: 1, nome: 'Ibuprofeno' });
  });

  it('deve criar medicamento', async () => {
    sql.mockResolvedValue([{ medicamento_id: 1, nome: 'Amoxicilina' }]);
    const dados = { nome: 'Amoxicilina', descricao: 'Antibiótico', concentracao: '500mg' };
    const result = await criarMedicamento(dados);
    expect(sql).toHaveBeenCalled();
    expect(result).toEqual({ medicamento_id: 1, nome: 'Amoxicilina' });
  });

  it('deve atualizar medicamento', async () => {
    sql.mockResolvedValue([{ medicamento_id: 1, nome: 'Novo Nome' }]);
    const result = await atualizarMedicamento(1, { nome: 'Novo Nome', descricao: 'Desc', concentracao: '100mg' });
    expect(sql).toHaveBeenCalled();
    expect(result.nome).toBe('Novo Nome');
  });

  it('deve deletar medicamento', async () => {
    sql.mockResolvedValue([]);
    await deletarMedicamento(1);
    expect(sql).toHaveBeenCalled();
  });
});
