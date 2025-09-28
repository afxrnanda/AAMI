// src/services/medicamento.service.js
import sql from '../supabase/db.js';

export async function listarMedicamentos() {
  return await sql`SELECT * FROM medicamentos ORDER BY medicamento_id`;
}

export async function buscarMedicamentoPorId(id) {
  const result = await sql`SELECT * FROM medicamentos WHERE medicamento_id = ${id}`;
  return result[0];
}

export async function criarMedicamento(data) {
  const { nome, descricao, concentracao } = data;

  const result = await sql`
    INSERT INTO medicamentos (nome, descricao, concentracao)
    VALUES (${nome}, ${descricao}, ${concentracao})
    RETURNING *
  `;

  return result[0];
}

export async function atualizarMedicamento(id, data) {
  const { nome, descricao, concentracao } = data;

  const result = await sql`
    UPDATE medicamentos
    SET nome = ${nome},
        descricao = ${descricao},
        concentracao = ${concentracao}
    WHERE medicamento_id = ${id}
    RETURNING *
  `;

  return result[0];
}

export async function deletarMedicamento(id) {
  await sql`DELETE FROM medicamentos WHERE medicamento_id = ${id}`;
}
