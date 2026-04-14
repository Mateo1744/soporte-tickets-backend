const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.post('/', ticketController.crearTicket);
router.get('/', ticketController.listarTickets);
router.get('/:id', ticketController.obtenerTicketPorId);
router.patch('/:id/estado', ticketController.cambiarEstado);
router.patch('/:id/asignar', ticketController.asignarTicket);

module.exports = router;