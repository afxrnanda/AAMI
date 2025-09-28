// src/services/paciente.service.js
import sql from '../supabase/db.js';

export async function listarPacientes() {
  return await sql`
    SELECT p.*, l.codigo AS leito_codigo
    FROM pacientes p
    LEFT JOIN leitos l ON p.leito_id = l.leito_id
    ORDER BY p.paciente_id
  `;
}

export async function buscarPacientePorId(id) {
  const result = await sql`
    SELECT p.*, l.codigo AS leito_codigo
    FROM pacientes p
    LEFT JOIN leitos l ON p.leito_id = l.leito_id
    WHERE p.paciente_id = ${id}
  `;
  return result[0];
}

export async function buscarPacientePorDocumento(documento) {
  const result = await sql`
    SELECT * FROM pacientes
    WHERE documento = ${documento}
  `;
  return result[0];
}

export async function criarPaciente(data) {
  const { nome, data_nascimento, sexo, documento, leito_id } = data;

  const result = await sql`
    INSERT INTO pacientes (nome, data_nascimento, sexo, documento, leito_id)
    VALUES (${nome}, ${data_nascimento}, ${sexo}, ${documento}, ${leito_id})
    RETURNING *
  `;

  return result[0];
}

export async function atualizarPaciente(id, data) {
  const { nome, data_nascimento, sexo, documento, leito_id } = data;

  const result = await sql`
    UPDATE pacientes
    SET nome = ${nome},
        data_nascimento = ${data_nascimento},
        sexo = ${sexo},
        documento = ${documento},
        leito_id = ${leito_id}
    WHERE paciente_id = ${id}
    RETURNING *
  `;

  return result[0];
}

export async function deletarPaciente(id) {
  await sql`DELETE FROM pacientes WHERE paciente_id = ${id}`;
}
