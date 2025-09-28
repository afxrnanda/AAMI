// test/atendimento.test.js
import request from 'supertest';
import app from '../server.js';

describe('Testes das rotas de Atendimento', () => {
  it('Deve criar um novo atendimento', async () => {
    const novoAtendimento = {
      paciente_id: 1,
      leito_id: 2,
      profissional_id: 3,
      tipo_atendimento: 'consulta',
      descricao: 'Consulta médica',
      observacoes: 'Sem observações'
    };

    const res = await request(app)
      .post('/atendimentos')
      .send(novoAtendimento);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('atendimento_id');
    expect(res.body.descricao).toBe(novoAtendimento.descricao);
  });

  it('Deve listar todos os atendimentos', async () => {
    const res = await request(app).get('/atendimentos');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Deve buscar um atendimento por ID', async () => {
    const atendimentoId = 1;
    const res = await request(app).get(`/atendimentos/${atendimentoId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('atendimento_id', atendimentoId);
  });

  it('Deve finalizar um atendimento', async () => {
    const atendimentoId = 1;
    const dados = { observacoes: 'Finalizado com sucesso' };

    const res = await request(app)
      .put(`/atendimentos/${atendimentoId}/finalizar`)
      .send(dados);

    expect(res.statusCode).toBe(200);
    expect(res.body.observacoes).toBe(dados.observacoes);
  });
});
