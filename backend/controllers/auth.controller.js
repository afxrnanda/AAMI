import * as authService from '../services/auth.service.js';

export async function cadastrar(req, res) {
  try {
    const funcionario = await authService.cadastrarFuncionario(req.body);
    res.status(201).json(funcionario);
  } catch (err) {
    console.error(err);
    res.status(400).json({ erro: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, senha } = req.body;
    const resultado = await authService.loginFuncionario(email, senha);
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(401).json({ erro: err.message });
  }
}
