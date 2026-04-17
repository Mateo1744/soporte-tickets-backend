const usuarioController = require('../../controllers/usuarioController');
const usuarioService = require('../../services/usuarioService');

describe('usuarioController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };

    res = {
        status: vi.fn(() => res),
        json: vi.fn()
    };

    vi.restoreAllMocks();
  });

  describe('crearUsuario', () => {
    it('debe responder con 201 y el usuario creado', async () => {
      const usuarioMock = {
        id: 1,
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        activo: true,
        Rol: {
          id: 3,
          nombre: 'USUARIO'
        }
      };

      req.body = {
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        password: '123456',
        rolId: 3
      };

      vi.spyOn(usuarioService, 'crearUsuario').mockResolvedValue(usuarioMock);

      await usuarioController.crearUsuario(req, res);

      expect(usuarioService.crearUsuario).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(usuarioMock);
    });

    it('debe responder con 400 si ocurre un error al crear usuario', async () => {
      req.body = {
        nombre: '',
        email: '',
        password: '',
        rolId: null
      };

      vi.spyOn(usuarioService, 'crearUsuario').mockRejectedValue(
        new Error('Todos los campos son obligatorios: nombre, email, password y rolId')
      );

      await usuarioController.crearUsuario(req, res);

      expect(usuarioService.crearUsuario).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Todos los campos son obligatorios: nombre, email, password y rolId'
      });
    });
  });

  describe('listarUsuarios', () => {
    it('debe responder con la lista de usuarios', async () => {
      const usuariosMock = [
        {
          id: 1,
          nombre: 'Mateo',
          email: 'mateo@correo.com',
          activo: true
        },
        {
          id: 2,
          nombre: 'Agente',
          email: 'agente@correo.com',
          activo: true
        }
      ];

      vi.spyOn(usuarioService, 'listarUsuarios').mockResolvedValue(usuariosMock);

      await usuarioController.listarUsuarios(req, res);

      expect(usuarioService.listarUsuarios).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(usuariosMock);
    });

    it('debe responder con 500 si ocurre un error al listar usuarios', async () => {
      vi.spyOn(usuarioService, 'listarUsuarios').mockRejectedValue(
        new Error('Error interno al listar usuarios')
      );

      await usuarioController.listarUsuarios(req, res);

      expect(usuarioService.listarUsuarios).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error interno al listar usuarios'
      });
    });
  });

  describe('obtenerUsuarioPorId', () => {
    it('debe responder con el usuario cuando existe', async () => {
      const usuarioMock = {
        id: 1,
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        activo: true
      };

      req.params = { id: 1 };

      vi.spyOn(usuarioService, 'obtenerUsuarioPorId').mockResolvedValue(usuarioMock);

      await usuarioController.obtenerUsuarioPorId(req, res);

      expect(usuarioService.obtenerUsuarioPorId).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(usuarioMock);
    });

    it('debe responder con 404 si el usuario no existe', async () => {
      req.params = { id: 999 };

      vi.spyOn(usuarioService, 'obtenerUsuarioPorId').mockRejectedValue(
        new Error('Usuario no encontrado')
      );

      await usuarioController.obtenerUsuarioPorId(req, res);

      expect(usuarioService.obtenerUsuarioPorId).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuario no encontrado'
      });
    });
  });

  describe('cambiarEstadoUsuario', () => {
    it('debe responder con el usuario actualizado', async () => {
      const usuarioActualizadoMock = {
        id: 1,
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        activo: false
      };

      req.params = { id: 1 };
      req.body = { activo: false };

      vi.spyOn(usuarioService, 'cambiarEstadoUsuario').mockResolvedValue(usuarioActualizadoMock);

      await usuarioController.cambiarEstadoUsuario(req, res);

      expect(usuarioService.cambiarEstadoUsuario).toHaveBeenCalledWith(1, false);
      expect(res.json).toHaveBeenCalledWith(usuarioActualizadoMock);
    });

    it('debe responder con 400 si ocurre un error al cambiar estado', async () => {
      req.params = { id: 1 };
      req.body = { activo: 'false' };

      vi.spyOn(usuarioService, 'cambiarEstadoUsuario').mockRejectedValue(
        new Error('El campo activo debe ser booleano')
      );

      await usuarioController.cambiarEstadoUsuario(req, res);

      expect(usuarioService.cambiarEstadoUsuario).toHaveBeenCalledWith(1, 'false');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'El campo activo debe ser booleano'
      });
    });
  });
});