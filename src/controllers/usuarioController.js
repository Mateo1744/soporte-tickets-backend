const usuarioService = require('../services/usuarioService');

async function crearUsuario(req, res) {
  try {
    const usuario = await usuarioService.crearUsuario(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function listarUsuarios(req, res) {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerUsuarioPorId(req, res) {
  try {
    const usuario = await usuarioService.obtenerUsuarioPorId(req.params.id);
    res.json(usuario);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

async function cambiarEstadoUsuario(req, res) {
  try {
    const { activo } = req.body;
    const usuario = await usuarioService.cambiarEstadoUsuario(req.params.id, activo);
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  crearUsuario,
  listarUsuarios,
  obtenerUsuarioPorId,
  cambiarEstadoUsuario
};