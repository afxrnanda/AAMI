// src/controllers/funcionario.controller.js
import * as funcionarioService from '../services/funcionario.service.js';

export async function listar(req, res) {
  try {
    const funcionarios = await funcionarioService.listarFuncionarios();
    res.json(funcionarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar funcionários' });
  }
}

export async function buscar(req, res) {
  try {
    const funcionario = await funcionarioService.buscarFuncionarioPorId(req.params.id);
    if (!funcionario) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });
    }
    res.json(funcionario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar funcionário' });
  }
}

export async function criar(req, res) {
  try {
    const funcionario = await funcionarioService.criarFuncionario(req.body);
    res.status(201).json(funcionario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar funcionário' });
  }
}

export async function atualizar(req, res) {
  try {
    const funcionario = await funcionarioService.atualizarFuncionario(req.params.id, req.body);
    if (!funcionario) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });
    }
    res.json(funcionario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar funcionário' });
  }
}

export async function deletar(req, res) {
  try {
    await funcionarioService.deletarFuncionario(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao deletar funcionário' });
  }
}
