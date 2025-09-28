import {
  listarFuncionarios,
  buscarFuncionarioPorId,
  criarFuncionario,
  atualizarFuncionario,
  deletarFuncionario
} from '../services/funcionario.service.js';

import sql from '../supabase/db.js';
import bcrypt from 'bcrypt';

jest.mock('../supabase/db.js');
jest.mock('bcrypt');

describe('Serviço de funcionário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve listar funcionários', async () => {
    sql.mockResolvedValue([{ funcionario_id: 1, nome: 'João', cargo: 'Enfermeiro' }]);
    const result = await listarFuncionarios();
    expect(sql).toHaveBeenCalled();
    expect(result).toEqual([{ funcionario_id: 1, nome: 'João', cargo: 'Enfermeiro' }]);
  });

  it('deve buscar funcionário por ID', async () => {
    sql.mockResolvedValue([{ funcionario_id: 1, nome: 'Maria' }]);
    const result = await buscarFuncionarioPorId(1);
    expect(sql).toHaveBeenCalled();
    expect(result).toEqual({ funcionario_id: 1, nome: 'Maria' });
  });

  it('deve criar funcionário com senha hash', async () => {
    bcrypt.hash.mockResolvedValue('hash-falso');
    sql.mockResolvedValue([{ funcionario_id: 1, nome: 'Carlos' }]);

    const dados = {
      nome: 'Carlos',
      cargo: 'Médico',
      registro_profissional: '12345',
      email: 'carlos@example.com',
      senha: 'senha123',
      telefone: '99999-9999'
    };

    const result = await criarFuncionario(dados);
    expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
    expect(sql).toHaveBeenCalled();
    expect(result).toEqual({ funcionario_id: 1, nome: 'Carlos' });
  });

  it('deve atualizar funcionário', async () => {
    sql.mockResolvedValue([{ funcionario_id: 1, nome: 'Carlos Atualizado' }]);
    const result = await atualizarFuncionario(1, {
      nome: 'Carlos Atualizado',
      cargo: 'Médico',
      registro_profissional: '12345',
      telefone: '88888-8888'
    });
    expect(sql).toHaveBeenCalled();
    expect(result.nome).toBe('Carlos Atualizado');
  });

  it('deve deletar funcionário', async () => {
    sql.mockResolvedValue([]);
    await deletarFuncionario(1);
    expect(sql).toHaveBeenCalled();
  });
});
