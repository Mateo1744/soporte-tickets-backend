const Ticket = require('../models/Ticket');
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');
const ESTADOS_VALIDOS = ['ABIERTO', 'EN_PROCESO', 'EN_ESPERA', 'RESUELTO', 'CERRADO'];
const PRIORIDADES_VALIDAS = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

async function generarNumeroTicket() {
  const total = await Ticket.count();
  const siguiente = total + 1;
  return `TCK-${String(siguiente).padStart(5, '0')}`;
}

function validarTransicionEstado(estadoActual, nuevoEstado) {
  const transicionesValidas = {
    ABIERTO: ['EN_PROCESO', 'EN_ESPERA'],
    EN_PROCESO: ['EN_ESPERA', 'RESUELTO'],
    EN_ESPERA: ['EN_PROCESO'],
    RESUELTO: ['CERRADO'],
    CERRADO: []
  };

  return transicionesValidas[estadoActual]?.includes(nuevoEstado);
}

async function crearTicket(data) {
  if (
    !data.titulo?.trim() ||
    !data.descripcion?.trim() ||
    !data.categoria?.trim() ||
    !data.prioridad ||
    !data.creadorId
  ) {
    throw new Error('Todos los campos son obligatorios: titulo, descripcion, categoria, prioridad y creadorId');
  }

  if (!PRIORIDADES_VALIDAS.includes(data.prioridad)) {
    throw new Error('La prioridad no es valida');
  }

  const creador = await Usuario.findByPk(data.creadorId);

  if (!creador) {
    throw new Error('El usuario creador no existe');
  }

  if (!creador.activo) {
    throw new Error('El usuario creador esta inactivo');
  }

  const numeroTicket = await generarNumeroTicket();

  const ticket = await Ticket.create({
    numeroTicket,
    titulo: data.titulo.trim(),
    descripcion: data.descripcion.trim(),
    categoria: data.categoria.trim(),
    prioridad: data.prioridad,
    creadorId: data.creadorId,
    estado: 'ABIERTO'
  });

  return ticket;
}

async function listarTickets(filtros = {}) {
  const where = {};

  if (filtros.estado) {
    where.estado = filtros.estado;
  }

  if (filtros.prioridad) {
    where.prioridad = filtros.prioridad;
  }

  if (filtros.categoria) {
    where.categoria = filtros.categoria;
  }

  if (filtros.creadorId) {
    where.creadorId = filtros.creadorId;
  }

  if (filtros.agenteAsignadoId) {
    where.agenteAsignadoId = filtros.agenteAsignadoId;
  }

  return await Ticket.findAll({
    where,
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
  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new Error('El estado no es valido');
  }

  const ticket = await Ticket.findByPk(id);

  if (!ticket) {
    throw new Error('Ticket no encontrado');
  }

  if (!validarTransicionEstado(ticket.estado, estado)) {
    throw new Error(`No se puede cambiar de ${ticket.estado} a ${estado}`);
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

  if (ticket.estado === 'CERRADO') {
    throw new Error('No se puede asignar un ticket cerrado');
  }

  const agente = await Usuario.findByPk(agenteId, {
    include: [{ model: Rol, attributes: ['nombre'] }]
  });

  if (!agente) {
    throw new Error('Agente no encontrado');
  }

  if (!agente.activo) {
    throw new Error('El agente esta inactivo');
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