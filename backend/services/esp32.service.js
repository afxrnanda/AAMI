import sql from '../supabase/db.js';

export async function atualizarPesoLeitoEsp32(id, { peso_inicial_g, peso_atual_g }) {
  if (peso_inicial_g === undefined || peso_atual_g === undefined) {
    throw new Error('peso_inicial_g e peso_atual_g são obrigatórios');
  }

  const result = await sql`
    UPDATE leitos
    SET peso_inicial_g = ${peso_inicial_g},
        peso_atual_g = ${peso_atual_g}
    WHERE leito_id = ${id}
    RETURNING *
  `;

  return result[0];
}
