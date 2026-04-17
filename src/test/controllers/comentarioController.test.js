const comentarioController = require('../../controllers/comentarioController');
const comentarioService = require('../../services/comentarioService');

describe('comentarioController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };

    res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn();

    vi.restoreAllMocks();
  });

  describe('crearComentario', () => {
    it('debe responder con 201 y el comentario creado', async () => {
      const comentarioMock = {
        id: 1,
        contenido: 'Estoy revisando el caso',
        tipo: 'INTERNO',
        ticketId: 1,
        usuarioId: 2
      };

      req.params = { id: 1 };
      req.body = {
        contenido: 'Estoy revisando el caso',
        tipo: 'INTERNO',
        usuarioId: 2
      };

      vi.spyOn(comentarioService, 'crearComentario').mockResolvedValue(comentarioMock);

      await comentarioController.crearComentario(req, res);

      expect(comentarioService.crearComentario).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(comentarioMock);
    });

    it('debe responder con 400 si ocurre un error al crear comentario', async () => {
      req.params = { id: 1 };
      req.body = {
        contenido: '',
        tipo: 'INTERNO',
        usuarioId: 2
      };

      vi.spyOn(comentarioService, 'crearComentario').mockRejectedValue(
        new Error('Todos los campos son obligatorios: contenido, tipo y usuarioId')
      );

      await comentarioController.crearComentario(req, res);

      expect(comentarioService.crearComentario).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Todos los campos son obligatorios: contenido, tipo y usuarioId'
      });
    });
  });

  describe('listarComentariosPorTicket', () => {
    it('debe responder con 200 y la lista de comentarios', async () => {
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

      req.params = { id: 1 };

      vi.spyOn(comentarioService, 'listarComentariosPorTicket').mockResolvedValue(comentariosMock);

      await comentarioController.listarComentariosPorTicket(req, res);

      expect(comentarioService.listarComentariosPorTicket).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(comentariosMock);
    });

    it('debe responder con 400 si ocurre un error al listar comentarios', async () => {
      req.params = { id: 999 };

      vi.spyOn(comentarioService, 'listarComentariosPorTicket').mockRejectedValue(
        new Error('Ticket no encontrado')
      );

      await comentarioController.listarComentariosPorTicket(req, res);

      expect(comentarioService.listarComentariosPorTicket).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Ticket no encontrado'
      });
    });
  });
});