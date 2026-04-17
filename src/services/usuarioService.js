const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

async function crearUsuario(data) {
  const { nombre, email, password, rolId } = data;

  if (!nombre?.trim() || !email?.trim() || !password?.trim() || !rolId) {
    throw new Error('Todos los campos son obligatorios: nombre, email, password y rolId');
  }

  const emailNormalizado = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(emailNormalizado)) {
    throw new Error('El correo no tiene un formato valido');
  }

  const usuarioExistente = await Usuario.findOne({
    where: { email: emailNormalizado }
  });

  if (usuarioExistente) {
    throw new Error('Ya existe un usuario con ese email');
  }

  const rol = await Rol.findByPk(rolId);

  if (!rol) {
    throw new Error('El rol no existe');
  }

  const usuario = await Usuario.create({
    nombre: nombre.trim(),
    email: emailNormalizado,
    password: password.trim(),
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
    include: [{ model: Rol, attributes: ['id', 'nombre'] }],
    order: [['id', 'ASC']]
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
  if (typeof activo !== 'boolean') {
    throw new Error('El campo activo debe ser booleano');
  }

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