// src/services/log.service.js
import sql from '../supabase/db.js';

export async function registrarLog({
  funcionario_id,
  tabela_afetada,
  id_registro,
  tipo_acao,
  descricao
}) {
  return await sql`
    INSERT INTO logs_alteracoes (
      funcionario_id, tabela_afetada, id_registro,
      tipo_acao, descricao
    )
    VALUES (
      ${funcionario_id}, ${tabela_afetada}, ${id_registro},
      ${tipo_acao}, ${descricao}
    )
    RETURNING *
  `;
}

export async function listarLogs(filtros = {}) {
  const { funcionario_id, tabela_afetada } = filtros;
  const conditions = [];

  if (funcionario_id) conditions.push(`l.funcionario_id = ${funcionario_id}`);
  if (tabela_afetada) conditions.push(`l.tabela_afetada = ${sql.literal(tabela_afetada)}`);

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return await sql.unsafe(`
    SELECT 
      l.*, f.nome AS funcionario_nome
    FROM logs_alteracoes l
    LEFT JOIN funcionarios f ON l.funcionario_id = f.funcionario_id
    ${where}
    ORDER BY l.data_log DESC
  `);
}
