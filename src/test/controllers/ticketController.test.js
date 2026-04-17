const ticketController = require('../../controllers/ticketController');
const ticketService = require('../../services/ticketService');

describe('ticketController', () => {
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

  describe('crearTicket', () => {
    it('debe responder con 201 y el ticket creado', async () => {
      const ticketMock = {
        id: 1,
        numeroTicket: 'TCK-00001',
        titulo: 'Error en impresora',
        descripcion: 'La impresora no responde',
        categoria: 'Hardware',
        prioridad: 'ALTA',
        creadorId: 1,
        estado: 'ABIERTO'
      };

      req.body = {
        titulo: 'Error en impresora',
        descripcion: 'La impresora no responde',
        categoria: 'Hardware',
        prioridad: 'ALTA',
        creadorId: 1
      };

      vi.spyOn(ticketService, 'crearTicket').mockResolvedValue(ticketMock);

      await ticketController.crearTicket(req, res);

      expect(ticketService.crearTicket).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(ticketMock);
    });

    it('debe responder con 400 si ocurre un error al crear ticket', async () => {
      req.body = {
        titulo: '',
        descripcion: '',
        categoria: '',
        prioridad: '',
        creadorId: null
      };

      vi.spyOn(ticketService, 'crearTicket').mockRejectedValue(
        new Error('Todos los campos son obligatorios: titulo, descripcion, categoria, prioridad y creadorId')
      );

      await ticketController.crearTicket(req, res);

      expect(ticketService.crearTicket).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Todos los campos son obligatorios: titulo, descripcion, categoria, prioridad y creadorId'
      });
    });
  });

  describe('listarTickets', () => {
    it('debe responder con la lista de tickets', async () => {
      const ticketsMock = [
        {
          id: 1,
          numeroTicket: 'TCK-00001',
          titulo: 'Error en impresora',
          estado: 'ABIERTO'
        },
        {
          id: 2,
          numeroTicket: 'TCK-00002',
          titulo: 'Error en red',
          estado: 'EN_PROCESO'
        }
      ];

      vi.spyOn(ticketService, 'listarTickets').mockResolvedValue(ticketsMock);

      await ticketController.listarTickets(req, res);

      expect(ticketService.listarTickets).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(ticketsMock);
    });

    it('debe responder con la lista de tickets filtrada', async () => {
      const ticketsMock = [
        {
          id: 1,
          numeroTicket: 'TCK-00001',
          titulo: 'Error en impresora',
          estado: 'ABIERTO'
        }
      ];

      req.query = { estado: 'ABIERTO', prioridad: 'ALTA' };

      vi.spyOn(ticketService, 'listarTickets').mockResolvedValue(ticketsMock);

      await ticketController.listarTickets(req, res);

      expect(ticketService.listarTickets).toHaveBeenCalledWith({
        estado: 'ABIERTO',
        prioridad: 'ALTA'
      });
      expect(res.json).toHaveBeenCalledWith(ticketsMock);
    });

    it('debe responder con 500 si ocurre un error al listar tickets', async () => {
      vi.spyOn(ticketService, 'listarTickets').mockRejectedValue(
        new Error('Error interno al listar tickets')
      );

      await ticketController.listarTickets(req, res);

      expect(ticketService.listarTickets).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error interno al listar tickets'
      });
    });
  });

  describe('obtenerTicketPorId', () => {
    it('debe responder con el ticket cuando existe', async () => {
      const ticketMock = {
        id: 1,
        numeroTicket: 'TCK-00001',
        titulo: 'Error en impresora',
        estado: 'ABIERTO'
      };

      req.params = { id: 1 };

      vi.spyOn(ticketService, 'obtenerTicketPorId').mockResolvedValue(ticketMock);

      await ticketController.obtenerTicketPorId(req, res);

      expect(ticketService.obtenerTicketPorId).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(ticketMock);
    });

    it('debe responder con 404 si el ticket no existe', async () => {
      req.params = { id: 999 };

      vi.spyOn(ticketService, 'obtenerTicketPorId').mockRejectedValue(
        new Error('Ticket no encontrado')
      );

      await ticketController.obtenerTicketPorId(req, res);

      expect(ticketService.obtenerTicketPorId).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Ticket no encontrado'
      });
    });
  });

  describe('cambiarEstado', () => {
    it('debe responder con el ticket actualizado', async () => {
      const ticketMock = {
        id: 1,
        numeroTicket: 'TCK-00001',
        estado: 'EN_PROCESO'
      };

      req.params = { id: 1 };
      req.body = { estado: 'EN_PROCESO' };

      vi.spyOn(ticketService, 'cambiarEstado').mockResolvedValue(ticketMock);

      await ticketController.cambiarEstado(req, res);

      expect(ticketService.cambiarEstado).toHaveBeenCalledWith(1, 'EN_PROCESO');
      expect(res.json).toHaveBeenCalledWith(ticketMock);
    });

    it('debe responder con 400 si ocurre un error al cambiar estado', async () => {
      req.params = { id: 1 };
      req.body = { estado: 'PAUSADO' };

      vi.spyOn(ticketService, 'cambiarEstado').mockRejectedValue(
        new Error('El estado no es valido')
      );

      await ticketController.cambiarEstado(req, res);

      expect(ticketService.cambiarEstado).toHaveBeenCalledWith(1, 'PAUSADO');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'El estado no es valido'
      });
    });
  });

  describe('asignarTicket', () => {
    it('debe responder con el ticket asignado', async () => {
      const ticketMock = {
        id: 1,
        numeroTicket: 'TCK-00001',
        agenteAsignadoId: 2
      };

      req.params = { id: 1 };
      req.body = { agenteId: 2 };

      vi.spyOn(ticketService, 'asignarTicket').mockResolvedValue(ticketMock);

      await ticketController.asignarTicket(req, res);

      expect(ticketService.asignarTicket).toHaveBeenCalledWith(1, 2);
      expect(res.json).toHaveBeenCalledWith(ticketMock);
    });

    it('debe responder con 400 si ocurre un error al asignar ticket', async () => {
      req.params = { id: 1 };
      req.body = { agenteId: 3 };

      vi.spyOn(ticketService, 'asignarTicket').mockRejectedValue(
        new Error('El usuario no tiene rol valido para atender tickets')
      );

      await ticketController.asignarTicket(req, res);

      expect(ticketService.asignarTicket).toHaveBeenCalledWith(1, 3);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'El usuario no tiene rol valido para atender tickets'
      });
    });
  });
});