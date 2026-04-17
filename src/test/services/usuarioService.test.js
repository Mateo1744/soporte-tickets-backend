const Usuario = require('../../models/Usuario');
const Rol = require('../../models/Rol');
const usuarioService = require('../../services/usuarioService');

describe('usuarioService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('crearUsuario', () => {
    it('debe crear un usuario correctamente cuando los datos son validos', async () => {
      const data = {
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        password: '123456',
        rolId: 3
      };

      vi.spyOn(Usuario, 'findOne').mockResolvedValue(null);
      vi.spyOn(Rol, 'findByPk').mockResolvedValue({ id: 3, nombre: 'USUARIO' });
      vi.spyOn(Usuario, 'create').mockResolvedValue({
        id: 1,
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        password: '123456',
        rolId: 3,
        activo: true
      });
      vi.spyOn(Usuario, 'findByPk').mockResolvedValue({
        id: 1,
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        activo: true,
        Rol: {
          id: 3,
          nombre: 'USUARIO'
        }
      });

      const resultado = await usuarioService.crearUsuario(data);

      expect(Usuario.findOne).toHaveBeenCalledWith({
        where: { email: 'mateo@correo.com' }
      });

      expect(Rol.findByPk).toHaveBeenCalledWith(3);

      expect(Usuario.create).toHaveBeenCalledWith({
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        password: '123456',
        rolId: 3,
        activo: true
      });

      expect(resultado).toEqual({
        id: 1,
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        activo: true,
        Rol: {
          id: 3,
          nombre: 'USUARIO'
        }
      });
    });

    it('debe normalizar email a minusculas y quitar espacios en los campos', async () => {
      const data = {
        nombre: '  Mateo Naranjo  ',
        email: '  MATEO@CORREO.COM  ',
        password: '  123456  ',
        rolId: 3
      };

      vi.spyOn(Usuario, 'findOne').mockResolvedValue(null);
      vi.spyOn(Rol, 'findByPk').mockResolvedValue({ id: 3, nombre: 'USUARIO' });
      vi.spyOn(Usuario, 'create').mockResolvedValue({
        id: 1,
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        password: '123456',
        rolId: 3,
        activo: true
      });
      vi.spyOn(Usuario, 'findByPk').mockResolvedValue({
        id: 1,
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        activo: true,
        Rol: {
          id: 3,
          nombre: 'USUARIO'
        }
      });

      await usuarioService.crearUsuario(data);

      expect(Usuario.findOne).toHaveBeenCalledWith({
        where: { email: 'mateo@correo.com' }
      });

      expect(Usuario.create).toHaveBeenCalledWith({
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        password: '123456',
        rolId: 3,
        activo: true
      });
    });

    it('no debe crear un usuario si el email ya existe', async () => {
      const data = {
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        password: '123456',
        rolId: 3
      };

      vi.spyOn(Usuario, 'findOne').mockResolvedValue({
        id: 99,
        email: 'mateo@correo.com'
      });

      const createSpy = vi.spyOn(Usuario, 'create');

      await expect(usuarioService.crearUsuario(data))
        .rejects
        .toThrow('Ya existe un usuario con ese email');

      expect(createSpy).not.toHaveBeenCalled();
    });

    it('no debe crear un usuario si el rol no existe', async () => {
      const data = {
        nombre: 'Mateo Naranjo',
        email: 'mateo2@correo.com',
        password: '123456',
        rolId: 999
      };

      vi.spyOn(Usuario, 'findOne').mockResolvedValue(null);
      vi.spyOn(Rol, 'findByPk').mockResolvedValue(null);

      const createSpy = vi.spyOn(Usuario, 'create');

      await expect(usuarioService.crearUsuario(data))
        .rejects
        .toThrow('El rol no existe');

      expect(createSpy).not.toHaveBeenCalled();
    });

    it('no debe crear un usuario si faltan campos obligatorios', async () => {
      const data = {
        nombre: 'Mateo Naranjo',
        email: '',
        password: '123456',
        rolId: 3
      };

      await expect(usuarioService.crearUsuario(data))
        .rejects
        .toThrow('Todos los campos son obligatorios: nombre, email, password y rolId');
    });

    it('no debe crear un usuario si los campos solo contienen espacios', async () => {
      const data = {
        nombre: '   ',
        email: '   ',
        password: '   ',
        rolId: 3
      };

      await expect(usuarioService.crearUsuario(data))
        .rejects
        .toThrow('Todos los campos son obligatorios: nombre, email, password y rolId');
    });

    it('no debe crear un usuario si el correo no tiene formato valido', async () => {
      const data = {
        nombre: 'Mateo Naranjo',
        email: 'correo-invalido',
        password: '123456',
        rolId: 3
      };

      await expect(usuarioService.crearUsuario(data))
        .rejects
        .toThrow('El correo no tiene un formato valido');
    });
  });

  describe('listarUsuarios', () => {
    it('debe listar usuarios sin password y ordenados por id', async () => {
      const usuariosMock = [
        {
          id: 1,
          nombre: 'Mateo',
          email: 'mateo@correo.com',
          activo: true,
          Rol: { id: 3, nombre: 'USUARIO' }
        },
        {
          id: 2,
          nombre: 'Agente',
          email: 'agente@correo.com',
          activo: true,
          Rol: { id: 2, nombre: 'AGENTE_SOPORTE' }
        }
      ];

      vi.spyOn(Usuario, 'findAll').mockResolvedValue(usuariosMock);

      const resultado = await usuarioService.listarUsuarios();

      expect(Usuario.findAll).toHaveBeenCalledWith({
        attributes: { exclude: ['password'] },
        include: [{ model: Rol, attributes: ['id', 'nombre'] }],
        order: [['id', 'ASC']]
      });

      expect(resultado).toEqual(usuariosMock);
    });
  });

  describe('obtenerUsuarioPorId', () => {
    it('debe retornar un usuario cuando existe', async () => {
      vi.spyOn(Usuario, 'findByPk').mockResolvedValue({
        id: 1,
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        activo: true,
        Rol: {
          id: 3,
          nombre: 'USUARIO'
        }
      });

      const resultado = await usuarioService.obtenerUsuarioPorId(1);

      expect(Usuario.findByPk).toHaveBeenCalledWith(1, {
        attributes: { exclude: ['password'] },
        include: [{ model: Rol, attributes: ['id', 'nombre'] }]
      });

      expect(resultado).toEqual({
        id: 1,
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        activo: true,
        Rol: {
          id: 3,
          nombre: 'USUARIO'
        }
      });
    });

    it('debe lanzar error si el usuario no existe', async () => {
      vi.spyOn(Usuario, 'findByPk').mockResolvedValue(null);

      await expect(usuarioService.obtenerUsuarioPorId(999))
        .rejects
        .toThrow('Usuario no encontrado');
    });
  });

  describe('cambiarEstadoUsuario', () => {
    it('debe cambiar el estado del usuario correctamente', async () => {
      const usuarioMock = {
        id: 1,
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        activo: true,
        save: vi.fn().mockResolvedValue()
      };

      vi.spyOn(Usuario, 'findByPk')
        .mockResolvedValueOnce(usuarioMock)
        .mockResolvedValueOnce({
          id: 1,
          nombre: 'Mateo Naranjo',
          email: 'mateo@correo.com',
          activo: false,
          Rol: {
            id: 3,
            nombre: 'USUARIO'
          }
        });

      const resultado = await usuarioService.cambiarEstadoUsuario(1, false);

      expect(usuarioMock.activo).toBe(false);
      expect(usuarioMock.save).toHaveBeenCalled();

      expect(resultado).toEqual({
        id: 1,
        nombre: 'Mateo Naranjo',
        email: 'mateo@correo.com',
        activo: false,
        Rol: {
          id: 3,
          nombre: 'USUARIO'
        }
      });
    });

    it('debe lanzar error si el campo activo no es booleano', async () => {
      await expect(usuarioService.cambiarEstadoUsuario(1, 'false'))
        .rejects
        .toThrow('El campo activo debe ser booleano');
    });

    it('debe lanzar error si intenta cambiar estado de un usuario inexistente', async () => {
      vi.spyOn(Usuario, 'findByPk').mockResolvedValue(null);

      await expect(usuarioService.cambiarEstadoUsuario(999, false))
        .rejects
        .toThrow('Usuario no encontrado');
    });
  });
});