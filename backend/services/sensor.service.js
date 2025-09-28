// src/services/sensor.service.js
import sql from '../supabase/db.js';

export async function listarSensores(filtros = {}) {
  const { leito_id, status } = filtros;
  const conditions = [];
  if (leito_id) conditions.push(`leito_id = ${leito_id}`);
  if (status) conditions.push(`status = ${sql.literal(status)}`);

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return await sql.unsafe(`SELECT * FROM sensores ${where} ORDER BY sensor_id`);
}

export async function buscarSensorPorId(id) {
  const result = await sql`SELECT * FROM sensores WHERE sensor_id = ${id}`;
  return result[0];
}

export async function criarSensor(data) {
  const {
    codigo_serial, tipo, status = 'ativo', bateria_percentual = 100,
    ultima_comunicacao, leito_id
  } = data;

  const result = await sql`
    INSERT INTO sensores (
      codigo_serial, tipo, status, bateria_percentual,
      ultima_comunicacao, leito_id
    )
    VALUES (
      ${codigo_serial}, ${tipo}, ${status}, ${bateria_percentual},
      ${ultima_comunicacao}, ${leito_id}
    )
    RETURNING *
  `;

  return result[0];
}

export async function atualizarSensor(id, data) {
  const {
    tipo, status, bateria_percentual,
    ultima_comunicacao, leito_id
  } = data;

  const result = await sql`
    UPDATE sensores
    SET tipo = ${tipo},
        status = ${status},
        bateria_percentual = ${bateria_percentual},
        ultima_comunicacao = ${ultima_comunicacao},
        leito_id = ${leito_id}
    WHERE sensor_id = ${id}
    RETURNING *
  `;

  return result[0];
}

export async function deletarSensor(id) {
  await sql`DELETE FROM sensores WHERE sensor_id = ${id}`;
}
