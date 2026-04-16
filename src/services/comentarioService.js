const Comentario = require('../models/Comentario');
const Ticket = require('../models/Ticket');
const Usuario = require('../models/Usuario');

const TIPOS_VALIDOS = ['INTERNO', 'EXTERNO'];

async function crearComentario(ticketId, data) {
  if (!ticketId) {
    throw new Error('El id del ticket es obligatorio');
  }

  if (!data.contenido?.trim() || !data.tipo || !data.usuarioId) {
    throw new Error('Todos los campos son obligatorios: contenido, tipo y usuarioId');
  }

  if (!TIPOS_VALIDOS.includes(data.tipo)) {
    throw new Error('El tipo de comentario no es valido');
  }

  const ticket = await Ticket.findByPk(ticketId);

  if (!ticket) {
    throw new Error('Ticket no encontrado');
  }

  const usuario = await Usuario.findByPk(data.usuarioId);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  if (!usuario.activo) {
    throw new Error('El usuario esta inactivo');
  }

  const comentario = await Comentario.create({
    contenido: data.contenido.trim(),
    tipo: data.tipo,
    ticketId,
    usuarioId: data.usuarioId
  });

  return comentario;
}

async function listarComentariosPorTicket(ticketId) {
  if (!ticketId) {
    throw new Error('El id del ticket es obligatorio');
  }

  const ticket = await Ticket.findByPk(ticketId);

  if (!ticket) {
    throw new Error('Ticket no encontrado');
  }

  const comentarios = await Comentario.findAll({
    where: { ticketId },
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nombre', 'email']
      }
    ],
    order: [['createdAt', 'ASC']]
  });

  return comentarios;
}

module.exports = {
  crearComentario,
  listarComentariosPorTicket
};