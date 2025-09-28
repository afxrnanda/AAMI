import sql from '../supabase/db.js';

const allowedFields = [
  'codigo', 'tipo', 'setor', 'ocupado', 'em_manutencao',
  'status_gotejamento', 'medicamento_atual', 'inicio_medicacao',
  'previsao_termino', 'peso_inicial_g', 'peso_atual_g',
  'data_ultima_ocupacao', 'observacoes', 'volume_ml',
  'dosagem_mg', 'fluxo_ml_h', 'taxa_gotejamento_gs',
  'tempo_restante_minutos', 'previsao_termino_calculada',
  'tempo_ocioso_segundos' // <-- novo campo
];

// LISTAR
export async function listarLeitos(filtros = {}) {
  const conditions = [];

  if (filtros.setor) {
    conditions.push(`l.setor = ${sql.literal(filtros.setor)}`);
  }
  if (filtros.ocupado !== undefined) {
    conditions.push(`l.ocupado = ${sql.literal(filtros.ocupado)}`);
  }
  if (filtros.em_manutencao !== undefined) {
    conditions.push(`l.em_manutencao = ${sql.literal(filtros.em_manutencao)}`);
  }
  if (filtros.status_gotejamento) {
    conditions.push(`l.status_gotejamento = ${sql.literal(filtros.status_gotejamento)}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  return await sql.unsafe(`
    SELECT *
    FROM leitos l
    ${where}
    ORDER BY l.leito_id
  `);
}

// BUSCAR POR ID
export async function buscarLeitoPorId(id) {
  const result = await sql`
    SELECT *
    FROM leitos
    WHERE leito_id = ${id}
  `;
  return result[0];
}

// CRIAR
export async function criarLeito(data) {
  const {
    codigo, tipo, setor,
    ocupado = false,
    em_manutencao = false,
    status_gotejamento = 'nenhum',
    medicamento_atual = null,
    inicio_medicacao = null,
    previsao_termino = null,
    peso_inicial_g = 0,
    peso_atual_g = 0,
    data_ultima_ocupacao = null,
    observacoes = null,
    volume_ml = null,
    dosagem_mg = null,
    fluxo_ml_h = null,
    tempo_ocioso_segundos = 0 // <-- novo campo com default
  } = data;

  const result = await sql`
    INSERT INTO leitos (
      codigo, tipo, setor,
      ocupado, em_manutencao, status_gotejamento,
      medicamento_atual, inicio_medicacao, previsao_termino,
      peso_inicial_g, peso_atual_g,
      data_ultima_ocupacao, observacoes,
      volume_ml, dosagem_mg, fluxo_ml_h,
      tempo_ocioso_segundos
    )
    VALUES (
      ${codigo}, ${tipo}, ${setor},
      ${ocupado}, ${em_manutencao}, ${status_gotejamento},
      ${medicamento_atual}, ${inicio_medicacao}, ${previsao_termino},
      ${peso_inicial_g}, ${peso_atual_g},
      ${data_ultima_ocupacao}, ${observacoes},
      ${volume_ml}, ${dosagem_mg}, ${fluxo_ml_h},
      ${tempo_ocioso_segundos}
    )
    RETURNING *
  `;

  return result[0];
}

export async function atualizarLeito(id, data) {
  const entries = Object.entries(data)
    .filter(([key, value]) => value !== undefined && allowedFields.includes(key));

  if (entries.length === 0) return null;

  const setClauses = entries.map(([key], idx) => `"${key}" = $${idx + 1}`);
  const values = entries.map(([, value]) => value);

  values.push(id);

  const query = `
    UPDATE leitos
    SET ${setClauses.join(', ')}
    WHERE leito_id = $${values.length}
    RETURNING *
  `;

  const result = await sql.unsafe(query, values);
  return result[0];
}

// DELETAR
export async function deletarLeito(id) {
  const result = await sql`
    DELETE FROM leitos
    WHERE leito_id = ${id}
    RETURNING *
  `;
  return result[0];
}