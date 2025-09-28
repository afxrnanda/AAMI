import  sql  from '../supabase/db.js';

export async function criarAtendimento(dados) {
  const {
    paciente_id,
    leito_id,
    profissional_id,
    tipo_atendimento,
    descricao,
    observacoes
  } = dados;

  const resultado = await sql`
    INSERT INTO atendimentos (
      paciente_id, leito_id, profissional_id, tipo_atendimento,
      descricao, observacoes
    )
    VALUES (
      ${paciente_id}, ${leito_id}, ${profissional_id}, ${tipo_atendimento},
      ${descricao}, ${observacoes}
    )
    RETURNING *
  `;

  return resultado[0];
}

export async function listarAtendimentos(filtros = {}) {
  let query = sql`
    SELECT a.*, 
           p.nome as paciente_nome,
           l.codigo as leito_codigo,
           f.nome as profissional_nome
    FROM atendimentos a
    LEFT JOIN pacientes p ON a.paciente_id = p.paciente_id
    LEFT JOIN leitos l ON a.leito_id = l.leito_id
    LEFT JOIN funcionarios f ON a.profissional_id = f.funcionario_id
    WHERE 1=1
  `;

  if (filtros.leito_id) {
    query = sql`${query} AND a.leito_id = ${filtros.leito_id}`;
  }

  if (filtros.paciente_id) {
    query = sql`${query} AND a.paciente_id = ${filtros.paciente_id}`;
  }

  if (filtros.profissional_id) {
    query = sql`${query} AND a.profissional_id = ${filtros.profissional_id}`;
  }

  if (filtros.tipo_atendimento) {
    query = sql`${query} AND a.tipo_atendimento = ${filtros.tipo_atendimento}`;
  }

  query = sql`${query} ORDER BY a.data_inicio DESC`;

  const atendimentos = await query;
  return atendimentos;
}

export async function buscarAtendimentoPorId(id) {
  const atendimento = await sql`
    SELECT a.*, 
           p.nome as paciente_nome,
           l.codigo as leito_codigo,
           f.nome as profissional_nome
    FROM atendimentos a
    LEFT JOIN pacientes p ON a.paciente_id = p.paciente_id
    LEFT JOIN leitos l ON a.leito_id = l.leito_id
    LEFT JOIN funcionarios f ON a.profissional_id = f.funcionario_id
    WHERE a.atendimento_id = ${id}
  `;
  return atendimento[0];
}

export async function finalizarAtendimento(id, dados) {
  const { observacoes } = dados;
  
  const resultado = await sql`
    UPDATE atendimentos
    SET data_fim = CURRENT_TIMESTAMP,
        observacoes = ${observacoes}
    WHERE atendimento_id = ${id}
    RETURNING *
  `;
  
  return resultado[0];
}