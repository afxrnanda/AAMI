// src/services/manutencao.service.js
import sql from '../supabase/db.js';

export async function listarManutencoes(filtros = {}) {
  const conditions = [];
  if (filtros.leito_id) conditions.push(`m.leito_id = ${filtros.leito_id}`);
  if (filtros.status) conditions.push(`m.status = ${sql.literal(filtros.status)}`);

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return await sql.unsafe(`
    SELECT 
      m.*, l.codigo AS leito_codigo, f.nome AS registrada_por_nome
    FROM manutencoes_programadas m
    LEFT JOIN leitos l ON m.leito_id = l.leito_id
    LEFT JOIN funcionarios f ON m.registrada_por = f.funcionario_id
    ${where}
    ORDER BY m.agendada_para DESC
  `);
}

export async function buscarManutencaoPorId(id) {
  const result = await sql`
    SELECT 
      m.*, l.codigo AS leito_codigo, f.nome AS registrada_por_nome
    FROM manutencoes_programadas m
    LEFT JOIN leitos l ON m.leito_id = l.leito_id
    LEFT JOIN funcionarios f ON m.registrada_por = f.funcionario_id
    WHERE m.manutencao_id = ${id}
  `;
  return result[0];
}

export async function agendarManutencao(data) {
  const {
    leito_id,
    motivo,
    observacoes,
    agendada_para,
    registrada_por
  } = data;

  const result = await sql`
    INSERT INTO manutencoes_programadas (
      leito_id, motivo, observacoes, agendada_para, registrada_por
    )
    VALUES (
      ${leito_id}, ${motivo}, ${observacoes}, ${agendada_para}, ${registrada_por}
    )
    RETURNING *
  `;

  return result[0];
}

export async function concluirManutencao(id, data) {
  const { realizada_em, status = 'concluida', observacoes } = data;

  const result = await sql`
    UPDATE manutencoes_programadas
    SET realizada_em = ${realizada_em},
        status = ${status},
        observacoes = ${observacoes}
    WHERE manutencao_id = ${id}
    RETURNING *
  `;

  return result[0];
}

export async function deletarManutencao(id) {
  await sql`DELETE FROM manutencoes_programadas WHERE manutencao_id = ${id}`;
}
