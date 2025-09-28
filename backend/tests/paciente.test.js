import request from 'supertest';
import app from '../server.js';

describe('Testes da rota /pacientes', () => {
  
  it('GET /pacientes deve retornar uma lista de pacientes', async () => {
    const res = await request(app).get('/pacientes');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Testa se objetos da lista têm a propriedade 'nome'
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('nome');
      expect(res.body[0]).toHaveProperty('leito_codigo'); 
    }
  });

  it('POST /pacientes deve criar um novo paciente', async () => {
    const novoPaciente = {
      nome: 'Teste Paciente',
      data_nascimento: '2000-01-01',
      sexo: 'M',
      documento: '99999999999',
      leito_id: null, 
    };

    const res = await request(app)
      .post('/pacientes')
      .send(novoPaciente);

    expect(res.statusCode).toBe(201); 
    expect(res.body).toHaveProperty('paciente_id');
    expect(res.body.nome).toBe('Teste Paciente');
    expect(res.body.documento).toBe('99999999999');
  });

});
