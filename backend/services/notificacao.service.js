import sql from '../supabase/db.js';

export async function criarNotificacao({ leito_id, titulo, mensagem, tipo }) {
  const result = await sql`
    INSERT INTO notificacoes (leito_id, titulo, mensagem, tipo)
    VALUES (${leito_id}, ${titulo}, ${mensagem}, ${tipo})
    RETURNING *
  `;
  return result[0];
}

export async function listarNotificacoes({ lida, leito_id } = {}) {
  let query = 'SELECT * FROM notificacoes';
  const conditions = [];
  if (lida !== undefined) conditions.push(`lida = ${lida}`);
  if (leito_id !== undefined) conditions.push(`leito_id = ${leito_id}`);
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY data DESC';
  return await sql.unsafe(query);
}

export async function marcarComoLida(id) {
  const result = await sql`
    UPDATE notificacoes SET lida = TRUE WHERE id = ${id} RETURNING *
  `;
  return result[0];
}

export async function limparNotificacoesAntigas() {
  const result = await sql`
    DELETE FROM notificacoes 
    WHERE lida = TRUE 
    AND data < NOW() - INTERVAL '7 days'
    RETURNING *
  `;
  return result;
}

// Função para executar limpeza automática (pode ser chamada por cron job)
export async function executarLimpezaAutomatica() {
  try {
    console.log('Iniciando limpeza automática de notificações antigas...');
    const removidas = await limparNotificacoesAntigas();
    console.log(`${removidas.length} notificações antigas removidas`);
    return removidas.length;
  } catch (error) {
    console.error('Erro na limpeza automática:', error);
    throw error;
  }
} 