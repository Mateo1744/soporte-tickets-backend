const ticketService = require('../services/ticketService');

async function crearTicket(req, res) {
  try {
    const ticket = await ticketService.crearTicket(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function listarTickets(req, res) {
  try {
    const tickets = await ticketService.listarTickets();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerTicketPorId(req, res) {
  try {
    const ticket = await ticketService.obtenerTicketPorId(req.params.id);
    res.json(ticket);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

async function cambiarEstado(req, res) {
  try {
    const ticket = await ticketService.cambiarEstado(req.params.id, req.body.estado);
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function asignarTicket(req, res) {
  try {
    const ticket = await ticketService.asignarTicket(req.params.id, req.body.agenteId);
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  crearTicket,
  listarTickets,
  obtenerTicketPorId,
  cambiarEstado,
  asignarTicket
};