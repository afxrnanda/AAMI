import sql from '../supabase/db.js';

export async function listarAplicacoes(filtros = {}) {
  const conditions = [];
  if (filtros.paciente_id) conditions.push(`p.paciente_id = ${filtros.paciente_id}`);
  if (filtros.leito_id) conditions.push(`p.leito_id = ${filtros.leito_id}`);
  if (filtros.status) conditions.push(`p.status = ${sql.literal(filtros.status)}`);
  if (filtros.aplicado_por) conditions.push(`p.aplicado_por = ${filtros.aplicado_por}`);

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return await sql.unsafe(`
    SELECT 
      p.*,
      f.nome AS aplicador_nome,
      pa.nome AS paciente_nome,
      m.nome AS medicamento_nome,
      l.codigo AS leito_codigo
    FROM medicacao_aplicada p
    LEFT JOIN funcionarios f ON p.aplicado_por = f.funcionario_id
    LEFT JOIN pacientes pa ON p.paciente_id = pa.paciente_id
    LEFT JOIN medicamentos m ON p.medicamento_id = m.medicamento_id
    LEFT JOIN leitos l ON p.leito_id = l.leito_id
    ${where}
    ORDER BY p.data_inicio DESC
  `);
}

export async function buscarAplicacaoPorId(id) {
  const result = await sql`
    SELECT 
      p.*,
      f.nome AS aplicador_nome,
      pa.nome AS paciente_nome,
      m.nome AS medicamento_nome,
      l.codigo AS leito_codigo
    FROM medicacao_aplicada p
    LEFT JOIN funcionarios f ON p.aplicado_por = f.funcionario_id
    LEFT JOIN pacientes pa ON p.paciente_id = pa.paciente_id
    LEFT JOIN medicamentos m ON p.medicamento_id = m.medicamento_id
    LEFT JOIN leitos l ON p.leito_id = l.leito_id
    WHERE p.aplicacao_id = ${id}
  `;
  return result[0];
}

export async function criarAplicacao(data) {
  const {
    paciente_id,
    medicamento_id,
    volume_ml,
    data_inicio,
    data_fim_estimada,
    aplicado_por,
    status = 'em andamento',
    observacoes,
    leito_id = null,
  } = data;

  const result = await sql`
    INSERT INTO medicacao_aplicada (
      paciente_id, medicamento_id, volume_ml, data_inicio,
      data_fim_estimada, aplicado_por, status, observacoes, leito_id
    )
    VALUES (
      ${paciente_id}, ${medicamento_id}, ${volume_ml}, ${data_inicio},
      ${data_fim_estimada}, ${aplicado_por}, ${status}, ${observacoes}, ${leito_id}
    )
    RETURNING *
  `;

  return result[0];
}

export async function atualizarAplicacao(id, data) {
  const {
    data_fim_estimada,
    data_fim_real,
    status,
    observacoes
  } = data;

  const result = await sql`
    UPDATE medicacao_aplicada
    SET data_fim_estimada = ${data_fim_estimada},
        data_fim_real = ${data_fim_real},
        status = ${status},
        observacoes = ${observacoes}
    WHERE aplicacao_id = ${id}
    RETURNING *
  `;

  return result[0];
}

export async function deletarAplicacao(id) {
  await sql`DELETE FROM medicacao_aplicada WHERE aplicacao_id = ${id}`;
}

// Novo: iniciar aplicação via LEITO (usado pelo ESP32 e pode ser usado pelo app também)
export async function iniciarAplicacaoViaLeito(leito_id, data) {
  const {
    paciente_id = null,         // opcional
    medicamento_id = null,      // opcional
    volume_ml = 0,
    dosagem_mg = 0,
    fluxo_ml_h = 0,
    peso_inicial_g = 0,
    observacoes = '',
    aplicado_por = null         // opcional (id do funcionário, se houver)
  } = data;

  const now = new Date();
  const tempoEstimadoHoras = fluxo_ml_h > 0 ? volume_ml / fluxo_ml_h : 0;
  const previsaoTermino = tempoEstimadoHoras > 0
    ? new Date(now.getTime() + tempoEstimadoHoras * 60 * 60 * 1000)
    : null;

  let leitoAtualizado;
  await sql.begin(async (tx) => {
    // Cria histórico (mesmo sem medicamento/paciente obrigatório)
    await tx`
      INSERT INTO medicacao_aplicada (
        leito_id, paciente_id, medicamento_id, volume_ml,
        data_inicio, data_fim_estimada, aplicado_por, status, observacoes
      )
      VALUES (
        ${leito_id}, ${paciente_id}, ${medicamento_id}, ${volume_ml},
        ${now}, ${previsaoTermino}, ${aplicado_por}, 'em andamento', ${observacoes}
      )
    `;

    // Atualiza estado do leito
    const resultLeito = await tx`
      UPDATE leitos
      SET 
        ocupado = TRUE,
        inicio_medicacao = ${now},
        previsao_termino = ${previsaoTermino},
        peso_inicial_g = ${peso_inicial_g},
        peso_atual_g = ${peso_inicial_g},
        volume_ml = ${volume_ml},
        dosagem_mg = ${dosagem_mg},
        fluxo_ml_h = ${fluxo_ml_h},
        status_gotejamento = 'em-andamento',
        observacoes = ${observacoes}
      WHERE leito_id = ${leito_id}
      RETURNING *
    `;

    leitoAtualizado = resultLeito[0];
  });

  return leitoAtualizado;
}

// Ajustado: finaliza por leito garantindo liberação do leito e fallback sem aplicação ativa
export async function finalizarAplicacaoPorLeito(leito_id) {
  // 1) Tenta encontrar aplicação ativa diretamente por leito_id
  let aplicacao = await sql`
    SELECT m.aplicacao_id, m.paciente_id
    FROM medicacao_aplicada m
    WHERE m.leito_id = ${leito_id} AND m.status = 'em andamento'
    ORDER BY m.data_inicio DESC
    LIMIT 1
  `;

  // 2) Fallback: tentar via relação paciente->leito como antes
  if (aplicacao.length === 0) {
    aplicacao = await sql`
      SELECT m.aplicacao_id, m.paciente_id
      FROM medicacao_aplicada m
      JOIN pacientes p ON m.paciente_id = p.paciente_id
      WHERE p.leito_id = ${leito_id} AND m.status = 'em andamento'
      ORDER BY m.data_inicio DESC
      LIMIT 1
    `;
  }

  const now = new Date();

  if (aplicacao.length === 0) {
    // 3) Sem aplicação ativa: ainda assim resetar/levar leito ao estado finalizado
    await sql.begin(async (tx) => {
      await tx`
        UPDATE leitos
        SET status_gotejamento = 'finalizado',
            ocupado = FALSE,
            peso_inicial_g = 0,
            peso_atual_g = 0,
            medicamento_atual = NULL,
            inicio_medicacao = NULL,
            previsao_termino = NULL
        WHERE leito_id = ${leito_id}
      `;
    });

    return { aplicacao_id: null, paciente_id: null, fallback: true };
  }

  const { aplicacao_id, paciente_id } = aplicacao[0];

  await sql.begin(async (tx) => {
    await tx`
      UPDATE medicacao_aplicada
      SET status = 'finalizado',
          data_fim_real = ${now}
      WHERE aplicacao_id = ${aplicacao_id}
    `;

    await tx`
      UPDATE leitos
      SET status_gotejamento = 'finalizado',
          ocupado = FALSE,
          peso_inicial_g = 0,
          peso_atual_g = 0,
          medicamento_atual = NULL,
          inicio_medicacao = NULL,
          previsao_termino = NULL
      WHERE leito_id = ${leito_id}
    `;

    if (paciente_id) {
      await tx`
        UPDATE pacientes
        SET leito_id = NULL
        WHERE paciente_id = ${paciente_id}
      `;
    }
  });

  return { aplicacao_id, paciente_id, fallback: false };
}