// src/services/funcionario.service.js
import sql from '../supabase/db.js';
import bcrypt from 'bcrypt';

export async function listarFuncionarios() {
  return await sql`SELECT funcionario_id, nome, cargo, email, telefone FROM funcionarios`;
}

export async function buscarFuncionarioPorId(id) {
  const result = await sql`SELECT funcionario_id, nome, cargo, email, telefone FROM funcionarios WHERE funcionario_id = ${id}`;
  return result[0];
}

export async function criarFuncionario(dados) {
  const { nome, cargo, registro_profissional, email, senha, telefone } = dados;

  const senha_hash = await bcrypt.hash(senha, 10);

  const result = await sql`
    INSERT INTO funcionarios (nome, cargo, registro_profissional, email, senha_hash, telefone)
    VALUES (${nome}, ${cargo}, ${registro_profissional}, ${email}, ${senha_hash}, ${telefone})
    RETURNING funcionario_id, nome, cargo, email, telefone
  `;

  return result[0];
}

export async function atualizarFuncionario(id, dados) {
  const { nome, cargo, registro_profissional, telefone } = dados;

  const result = await sql`
    UPDATE funcionarios
    SET nome = ${nome}, cargo = ${cargo}, registro_profissional = ${registro_profissional}, telefone = ${telefone}
    WHERE funcionario_id = ${id}
    RETURNING funcionario_id, nome, cargo, email, telefone
  `;

  return result[0];
}

export async function deletarFuncionario(id) {
  await sql`DELETE FROM funcionarios WHERE funcionario_id = ${id}`;
}
