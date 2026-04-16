const comentarioService = require('../services/comentarioService');

async function crearComentario(req, res) {
  try {
    const comentario = await comentarioService.crearComentario(req.params.id, req.body);
    return res.status(201).json(comentario);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function listarComentariosPorTicket(req, res) {
  try {
    const comentarios = await comentarioService.listarComentariosPorTicket(req.params.id);
    return res.status(200).json(comentarios);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  crearComentario,
  listarComentariosPorTicket
};