const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

async function crearUsuario(data) {
  const { nombre, email, password, rolId } = data;

  if (!nombre || !email || !password || !rolId) {
    throw new Error('Todos los campos son obligatorios: nombre, email, password y rolId');
  }

  const usuarioExistente = await Usuario.findOne({ where: { email } });
  if (usuarioExistente) {
    throw new Error('Ya existe un usuario con ese email');
  }

  const rol = await Rol.findByPk(rolId);
  if (!rol) {
    throw new Error('El rol no existe');
  }

  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    rolId,
    activo: true
  });

  return await Usuario.findByPk(usuario.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Rol, attributes: ['id', 'nombre'] }]
  });
}

async function listarUsuarios() {
  return await Usuario.findAll({
    attributes: { exclude: ['password'] },
    include: [{ model: Rol, attributes: ['id', 'nombre'] }]
  });
}

async function obtenerUsuarioPorId(id) {
  const usuario = await Usuario.findByPk(id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Rol, attributes: ['id', 'nombre'] }]
  });

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  return usuario;
}

async function cambiarEstadoUsuario(id, activo) {
  const usuario = await Usuario.findByPk(id);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  usuario.activo = activo;
  await usuario.save();

  return await Usuario.findByPk(usuario.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Rol, attributes: ['id', 'nombre'] }]
  });
}

module.exports = {
  crearUsuario,
  listarUsuarios,
  obtenerUsuarioPorId,
  cambiarEstadoUsuario
};