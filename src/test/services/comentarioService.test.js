const Comentario = require('../../models/Comentario');
const Ticket = require('../../models/Ticket');
const Usuario = require('../../models/Usuario');
const comentarioService = require('../../services/comentarioService');

describe('comentarioService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('crearComentario', () => {
    it('debe crear un comentario correctamente cuando los datos son validos', async () => {
      const data = {
        contenido: '  Estoy revisando el caso  ',
        tipo: 'INTERNO',
        usuarioId: 2
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue({
        id: 1,
        titulo: 'Error en impresora'
      });

      vi.spyOn(Usuario, 'findByPk').mockResolvedValue({
        id: 2,
        nombre: 'Agente Soporte',
        activo: true
      });

      vi.spyOn(Comentario, 'create').mockResolvedValue({
        id: 1,
        contenido: 'Estoy revisando el caso',
        tipo: 'INTERNO',
        ticketId: 1,
        usuarioId: 2
      });

      const resultado = await comentarioService.crearComentario(1, data);

      expect(Ticket.findByPk).toHaveBeenCalledWith(1);
      expect(Usuario.findByPk).toHaveBeenCalledWith(2);
      expect(Comentario.create).toHaveBeenCalledWith({
        contenido: 'Estoy revisando el caso',
        tipo: 'INTERNO',
        ticketId: 1,
        usuarioId: 2
      });

      expect(resultado).toEqual({
        id: 1,
        contenido: 'Estoy revisando el caso',
        tipo: 'INTERNO',
        ticketId: 1,
        usuarioId: 2
      });
    });

    it('debe permitir crear comentario EXTERNO', async () => {
      const data = {
        contenido: 'Respuesta enviada al usuario',
        tipo: 'EXTERNO',
        usuarioId: 2
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue({ id: 1 });
      vi.spyOn(Usuario, 'findByPk').mockResolvedValue({
        id: 2,
        activo: true
      });
      vi.spyOn(Comentario, 'create').mockResolvedValue({
        id: 2,
        contenido: 'Respuesta enviada al usuario',
        tipo: 'EXTERNO',
        ticketId: 1,
        usuarioId: 2
      });

      const resultado = await comentarioService.crearComentario(1, data);

      expect(resultado).toEqual({
        id: 2,
        contenido: 'Respuesta enviada al usuario',
        tipo: 'EXTERNO',
        ticketId: 1,
        usuarioId: 2
      });
    });

    it('debe fallar si el id del ticket no es enviado', async () => {
      const data = {
        contenido: 'Comentario',
        tipo: 'INTERNO',
        usuarioId: 2
      };

      await expect(comentarioService.crearComentario(null, data))
        .rejects
        .toThrow('El id del ticket es obligatorio');
    });

    it('debe fallar si faltan campos obligatorios', async () => {
      const data = {
        contenido: '',
        tipo: 'INTERNO',
        usuarioId: 2
      };

      await expect(comentarioService.crearComentario(1, data))
        .rejects
        .toThrow('Todos los campos son obligatorios: contenido, tipo y usuarioId');
    });

    it('debe fallar si el contenido solo tiene espacios', async () => {
      const data = {
        contenido: '   ',
        tipo: 'INTERNO',
        usuarioId: 2
      };

      await expect(comentarioService.crearComentario(1, data))
        .rejects
        .toThrow('Todos los campos son obligatorios: contenido, tipo y usuarioId');
    });

    it('debe fallar si el tipo de comentario no es valido', async () => {
      const data = {
        contenido: 'Comentario de prueba',
        tipo: 'PRIVADO',
        usuarioId: 2
      };

      await expect(comentarioService.crearComentario(1, data))
        .rejects
        .toThrow('El tipo de comentario no es valido');
    });

    it('debe fallar si el ticket no existe', async () => {
      const data = {
        contenido: 'Comentario de prueba',
        tipo: 'INTERNO',
        usuarioId: 2
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(null);

      await expect(comentarioService.crearComentario(999, data))
        .rejects
        .toThrow('Ticket no encontrado');
    });

    it('debe fallar si el usuario no existe', async () => {
      const data = {
        contenido: 'Comentario de prueba',
        tipo: 'INTERNO',
        usuarioId: 999
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue({ id: 1 });
      vi.spyOn(Usuario, 'findByPk').mockResolvedValue(null);

      await expect(comentarioService.crearComentario(1, data))
        .rejects
        .toThrow('Usuario no encontrado');
    });

    it('debe fallar si el usuario esta inactivo', async () => {
      const data = {
        contenido: 'Comentario de prueba',
        tipo: 'INTERNO',
        usuarioId: 2
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue({ id: 1 });
      vi.spyOn(Usuario, 'findByPk').mockResolvedValue({
        id: 2,
        activo: false
      });

      await expect(comentarioService.crearComentario(1, data))
        .rejects
        .toThrow('El usuario esta inactivo');
    });
  });

  describe('listarComentariosPorTicket', () => {
    it('debe listar los comentarios de un ticket', async () => {
      const comentariosMock = [
        {
          id: 1,
          contenido: 'Primer comentario',
          tipo: 'INTERNO',
          ticketId: 1,
          usuarioId: 2
        },
        {
          id: 2,
          contenido: 'Segundo comentario',
          tipo: 'EXTERNO',
          ticketId: 1,
          usuarioId: 2
        }
      ];

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue({ id: 1 });
      vi.spyOn(Comentario, 'findAll').mockResolvedValue(comentariosMock);

      const resultado = await comentarioService.listarComentariosPorTicket(1);

      expect(Ticket.findByPk).toHaveBeenCalledWith(1);
      expect(Comentario.findAll).toHaveBeenCalledWith({
        where: { ticketId: 1 },
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'email']
          }
        ],
        order: [['createdAt', 'ASC']]
      });

      expect(resultado).toEqual(comentariosMock);
    });

    it('debe fallar si el id del ticket no es enviado al listar comentarios', async () => {
      await expect(comentarioService.listarComentariosPorTicket(null))
        .rejects
        .toThrow('El id del ticket es obligatorio');
    });

    it('debe fallar si el ticket no existe al listar comentarios', async () => {
      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(null);

      await expect(comentarioService.listarComentariosPorTicket(999))
        .rejects
        .toThrow('Ticket no encontrado');
    });
  });
});