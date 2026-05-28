const filmeModel = require("../models/filmeModel");

async function listar(req, res) {
  try {
    const filmes = await filmeModel.listarTodos();
    return res.status(200).json({ status: true, items: filmes.length, filmes });
  } catch (erro) {
    return res.status(500).json({ status: false, message: "Erro ao listar filmes." });
  }
}

async function buscarPorId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ status: false, message: "ID inválido." });
  }
  try {
    const filme = await filmeModel.buscarPorId(id);
    if (!filme) {
      return res.status(404).json({ status: false, message: "Filme não encontrado." });
    }
    return res.status(200).json({ status: true, filme });
  } catch (erro) {
    return res.status(500).json({ status: false, message: "Erro ao buscar filme." });
  }
}

async function filtrar(req, res) {
  const nome = (req.query.nome || "").trim();
  if (nome === "") {
    return res.status(400).json({ status: false, message: "Parâmetro 'nome' é obrigatório." });
  }
  try {
    const filmes = await filmeModel.filtrar(nome);
    return res.status(200).json({ status: true, items: filmes.length, filmes });
  } catch (erro) {
    return res.status(500).json({ status: false, message: "Erro ao filtrar filmes." });
  }
}

module.exports = { listar, buscarPorId, filtrar };
