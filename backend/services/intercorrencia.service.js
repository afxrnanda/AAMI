// src/services/intercorrencia.service.js
import sql from '../supabase/db.js';

// Listar intercorrencias com filtros
export async function listarIntercorrencias(filtros = {}) {
  try {
    let query = sql`
      SELECT *
      FROM intercorrencias
      ORDER BY data_registro DESC
    `;

    if (filtros.leito_id) {
      query = sql`
        SELECT *
        FROM intercorrencias
        WHERE leito_id = ${filtros.leito_id}
        ORDER BY data_registro DESC
      `;
    }

    if (filtros.status) {
      query = sql`
        SELECT *
        FROM intercorrencias
        WHERE status = ${filtros.status}
        ORDER BY data_registro DESC
      `;
    }

    const data = await query;
    return data || [];
  } catch (error) {
    console.error('Erro ao listar intercorrencias:', error);
    throw error;
  }
}

// Buscar intercorrencia por ID
export async function buscarIntercorrenciaPorId(id) {
  try {
    const result = await sql`
      SELECT *
      FROM intercorrencias
      WHERE id = ${id}
    `;

    return result[0] || null;
  } catch (error) {
    console.error('Erro ao buscar intercorrencia:', error);
    throw error;
  }
}

// Criar nova intercorrencia
export async function criarIntercorrencia(dados) {
  try {
    const result = await sql`
      INSERT INTO intercorrencias (leito_id, descricao, status)
      VALUES (${dados.leito_id}, ${dados.descricao}, 'pendente')
      RETURNING *
    `;

    return result[0];
  } catch (error) {
    console.error('Erro ao criar intercorrencia:', error);
    throw error;
  }
}

// Atualizar intercorrencia existente
export async function atualizarIntercorrencia(id, dados) {
  try {
    const result = await sql`
      UPDATE intercorrencias
      SET 
        descricao = COALESCE(${dados.descricao}, descricao),
        status = COALESCE(${dados.status}, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return result[0] || null;
  } catch (error) {
    console.error('Erro ao atualizar intercorrencia:', error);
    throw error;
  }
}

// Deletar intercorrencia
export async function deletarIntercorrencia(id) {
  try {
    const result = await sql`
      DELETE FROM intercorrencias
      WHERE id = ${id}
      RETURNING *
    `;

    return result[0];
  } catch (error) {
    console.error('Erro ao deletar intercorrencia:', error);
    throw error;
  }
}

// Limpar todas as intercorrencias de um leito
export async function limparIntercorrenciasDoLeito(leito_id) {
  try {
    const result = await sql`
      DELETE FROM intercorrencias
      WHERE leito_id = ${leito_id}
      RETURNING *
    `;

    return result;
  } catch (error) {
    console.error('Erro ao limpar intercorrencias do leito:', error);
    throw error;
  }
} 