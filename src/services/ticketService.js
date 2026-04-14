const Ticket = require('../models/Ticket');
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

async function generarNumeroTicket() {
  const total = await Ticket.count();
  const siguiente = total + 1;
  return `TCK-${String(siguiente).padStart(5, '0')}`;
}

async function crearTicket(data) {
  const creador = await Usuario.findByPk(data.creadorId);

  if (!creador) {
    throw new Error('El usuario creador no existe');
  }

  const numeroTicket = await generarNumeroTicket();

  const ticket = await Ticket.create({
    numeroTicket,
    titulo: data.titulo,
    descripcion: data.descripcion,
    categoria: data.categoria,
    prioridad: data.prioridad,
    creadorId: data.creadorId
  });

  return ticket;
}

async function listarTickets() {
  return await Ticket.findAll({
    include: [
      { model: Usuario, as: 'creador', attributes: ['id', 'nombre', 'email'] },
      { model: Usuario, as: 'agenteAsignado', attributes: ['id', 'nombre', 'email'], required: false }
    ]
  });
}

async function obtenerTicketPorId(id) {
  const ticket = await Ticket.findByPk(id, {
    include: [
      { model: Usuario, as: 'creador', attributes: ['id', 'nombre', 'email'] },
      { model: Usuario, as: 'agenteAsignado', attributes: ['id', 'nombre', 'email'], required: false }
    ]
  });

  if (!ticket) {
    throw new Error('Ticket no encontrado');
  }

  return ticket;
}

async function cambiarEstado(id, estado) {
  const ticket = await Ticket.findByPk(id);

  if (!ticket) {
    throw new Error('Ticket no encontrado');
  }

  ticket.estado = estado;

  if (estado === 'RESUELTO' || estado === 'CERRADO') {
    ticket.fechaCierre = new Date();
  } else {
    ticket.fechaCierre = null;
  }

  await ticket.save();
  return ticket;
}

async function asignarTicket(id, agenteId) {
  const ticket = await Ticket.findByPk(id);

  if (!ticket) {
    throw new Error('Ticket no encontrado');
  }

  const agente = await Usuario.findByPk(agenteId, {
    include: [{ model: Rol, attributes: ['nombre'] }]
  });

  if (!agente) {
    throw new Error('Agente no encontrado');
  }

  const rol = agente.Rol?.nombre;
  if (rol !== 'AGENTE_SOPORTE' && rol !== 'SUPERVISOR') {
    throw new Error('El usuario no tiene rol valido para atender tickets');
  }

  ticket.agenteAsignadoId = agenteId;
  await ticket.save();

  return ticket;
}

module.exports = {
  crearTicket,
  listarTickets,
  obtenerTicketPorId,
  cambiarEstado,
  asignarTicket
};