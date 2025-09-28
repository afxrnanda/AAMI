import sql from '../supabase/db.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

export async function cadastrarFuncionario(data) {
  const { nome, cargo, registro_profissional, email, senha, telefone } = data;

  const senha_hash = await hashPassword(senha);

  const result = await sql`
    INSERT INTO funcionarios (nome, cargo, registro_profissional, email, senha_hash, telefone)
    VALUES (${nome}, ${cargo}, ${registro_profissional}, ${email}, ${senha_hash}, ${telefone})
    RETURNING funcionario_id, nome, cargo, registro_profissional, email, telefone, criado_em
  `;

  return result[0];
}

export async function loginFuncionario(email, senha) {
  const result = await sql`
    SELECT * FROM funcionarios WHERE email = ${email}
  `;
  const funcionario = result[0];

  if (!funcionario) {
    throw new Error('Email ou senha incorretos');
  }

  const senhaValida = await comparePassword(senha, funcionario.senha_hash);
  if (!senhaValida) {
    throw new Error('Email ou senha incorretos');
  }

  // Retira a senha do objeto antes de gerar token e retornar
  const { senha_hash, ...usuarioSemSenha } = funcionario;

  const token = generateToken({ id: funcionario.funcionario_id, email: funcionario.email });

  return { usuario: usuarioSemSenha, token };
}
