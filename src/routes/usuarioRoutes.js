const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.post('/', usuarioController.crearUsuario);
router.get('/', usuarioController.listarUsuarios);
router.get('/:id', usuarioController.obtenerUsuarioPorId);
router.patch('/:id/estado', usuarioController.cambiarEstadoUsuario);

module.exports = router;