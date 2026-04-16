const express = require('express');
const router = express.Router({ mergeParams: true });
const comentarioController = require('../controllers/comentarioController');

router.post('/', comentarioController.crearComentario);
router.get('/', comentarioController.listarComentariosPorTicket);

module.exports = router;