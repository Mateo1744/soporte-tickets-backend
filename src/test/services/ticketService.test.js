const Ticket = require('../../models/Ticket');
const Usuario = require('../../models/Usuario');
const Rol = require('../../models/Rol');
const ticketService = require('../../services/ticketService');

describe('ticketService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('crearTicket', () => {
    it('debe crear un ticket correctamente cuando los datos son validos', async () => {
      const data = {
        titulo: '  Error en impresora  ',
        descripcion: '  La impresora no responde  ',
        categoria: '  Hardware  ',
        prioridad: 'ALTA',
        creadorId: 1
      };

      vi.spyOn(Usuario, 'findByPk').mockResolvedValue({
        id: 1,
        nombre: 'Mateo',
        activo: true
      });

      vi.spyOn(Ticket, 'count').mockResolvedValue(0);

      vi.spyOn(Ticket, 'create').mockResolvedValue({
        id: 1,
        numeroTicket: 'TCK-00001',
        titulo: 'Error en impresora',
        descripcion: 'La impresora no responde',
        categoria: 'Hardware',
        prioridad: 'ALTA',
        creadorId: 1,
        estado: 'ABIERTO'
      });

      const resultado = await ticketService.crearTicket(data);

      expect(Usuario.findByPk).toHaveBeenCalledWith(1);
      expect(Ticket.count).toHaveBeenCalled();
      expect(Ticket.create).toHaveBeenCalledWith({
        numeroTicket: 'TCK-00001',
        titulo: 'Error en impresora',
        descripcion: 'La impresora no responde',
        categoria: 'Hardware',
        prioridad: 'ALTA',
        creadorId: 1,
        estado: 'ABIERTO'
      });

      expect(resultado).toEqual({
        id: 1,
        numeroTicket: 'TCK-00001',
        titulo: 'Error en impresora',
        descripcion: 'La impresora no responde',
        categoria: 'Hardware',
        prioridad: 'ALTA',
        creadorId: 1,
        estado: 'ABIERTO'
      });
    });

    it('debe fallar si faltan campos obligatorios', async () => {
      const data = {
        titulo: '',
        descripcion: 'Descripcion',
        categoria: 'Hardware',
        prioridad: 'ALTA',
        creadorId: 1
      };

      await expect(ticketService.crearTicket(data))
        .rejects
        .toThrow('Todos los campos son obligatorios: titulo, descripcion, categoria, prioridad y creadorId');
    });

    it('debe fallar si los campos de texto solo tienen espacios', async () => {
      const data = {
        titulo: '   ',
        descripcion: '   ',
        categoria: '   ',
        prioridad: 'ALTA',
        creadorId: 1
      };

      await expect(ticketService.crearTicket(data))
        .rejects
        .toThrow('Todos los campos son obligatorios: titulo, descripcion, categoria, prioridad y creadorId');
    });

    it('debe fallar si la prioridad no es valida', async () => {
      const data = {
        titulo: 'Error en red',
        descripcion: 'No hay internet',
        categoria: 'Red',
        prioridad: 'URGENTE',
        creadorId: 1
      };

      await expect(ticketService.crearTicket(data))
        .rejects
        .toThrow('La prioridad no es valida');
    });

    it('debe fallar si el usuario creador no existe', async () => {
      const data = {
        titulo: 'Error en red',
        descripcion: 'No hay internet',
        categoria: 'Red',
        prioridad: 'ALTA',
        creadorId: 999
      };

      vi.spyOn(Usuario, 'findByPk').mockResolvedValue(null);

      await expect(ticketService.crearTicket(data))
        .rejects
        .toThrow('El usuario creador no existe');
    });

    it('debe fallar si el usuario creador esta inactivo', async () => {
      const data = {
        titulo: 'Error en red',
        descripcion: 'No hay internet',
        categoria: 'Red',
        prioridad: 'ALTA',
        creadorId: 1
      };

      vi.spyOn(Usuario, 'findByPk').mockResolvedValue({
        id: 1,
        activo: false
      });

      await expect(ticketService.crearTicket(data))
        .rejects
        .toThrow('El usuario creador esta inactivo');
    });
  });

  describe('listarTickets', () => {
    it('debe listar todos los tickets sin filtros', async () => {
      const ticketsMock = [
        { id: 1, numeroTicket: 'TCK-00001' },
        { id: 2, numeroTicket: 'TCK-00002' }
      ];

      vi.spyOn(Ticket, 'findAll').mockResolvedValue(ticketsMock);

      const resultado = await ticketService.listarTickets();

      expect(Ticket.findAll).toHaveBeenCalledWith({
        where: {},
        include: [
          { model: Usuario, as: 'creador', attributes: ['id', 'nombre', 'email'] },
          { model: Usuario, as: 'agenteAsignado', attributes: ['id', 'nombre', 'email'], required: false }
        ]
      });

      expect(resultado).toEqual(ticketsMock);
    });

    it('debe listar tickets aplicando filtros', async () => {
      const filtros = {
        estado: 'ABIERTO',
        prioridad: 'ALTA',
        categoria: 'Hardware',
        creadorId: 1,
        agenteAsignadoId: 2
      };

      const ticketsMock = [{ id: 1, numeroTicket: 'TCK-00001' }];

      vi.spyOn(Ticket, 'findAll').mockResolvedValue(ticketsMock);

      const resultado = await ticketService.listarTickets(filtros);

      expect(Ticket.findAll).toHaveBeenCalledWith({
        where: {
          estado: 'ABIERTO',
          prioridad: 'ALTA',
          categoria: 'Hardware',
          creadorId: 1,
          agenteAsignadoId: 2
        },
        include: [
          { model: Usuario, as: 'creador', attributes: ['id', 'nombre', 'email'] },
          { model: Usuario, as: 'agenteAsignado', attributes: ['id', 'nombre', 'email'], required: false }
        ]
      });

      expect(resultado).toEqual(ticketsMock);
    });
  });

  describe('obtenerTicketPorId', () => {
    it('debe retornar un ticket cuando existe', async () => {
      const ticketMock = {
        id: 1,
        numeroTicket: 'TCK-00001',
        titulo: 'Error en impresora'
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(ticketMock);

      const resultado = await ticketService.obtenerTicketPorId(1);

      expect(Ticket.findByPk).toHaveBeenCalledWith(1, {
        include: [
          { model: Usuario, as: 'creador', attributes: ['id', 'nombre', 'email'] },
          { model: Usuario, as: 'agenteAsignado', attributes: ['id', 'nombre', 'email'], required: false }
        ]
      });

      expect(resultado).toEqual(ticketMock);
    });

    it('debe lanzar error si el ticket no existe', async () => {
      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(null);

      await expect(ticketService.obtenerTicketPorId(999))
        .rejects
        .toThrow('Ticket no encontrado');
    });
  });

  describe('cambiarEstado', () => {
    it('debe cambiar el estado correctamente cuando la transicion es valida', async () => {
      const ticketMock = {
        id: 1,
        estado: 'ABIERTO',
        fechaCierre: null,
        save: vi.fn().mockResolvedValue()
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(ticketMock);

      const resultado = await ticketService.cambiarEstado(1, 'EN_PROCESO');

      expect(ticketMock.estado).toBe('EN_PROCESO');
      expect(ticketMock.fechaCierre).toBeNull();
      expect(ticketMock.save).toHaveBeenCalled();
      expect(resultado).toBe(ticketMock);
    });

    it('debe asignar fechaCierre cuando el estado cambia a RESUELTO', async () => {
      const ticketMock = {
        id: 1,
        estado: 'EN_PROCESO',
        fechaCierre: null,
        save: vi.fn().mockResolvedValue()
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(ticketMock);

      await ticketService.cambiarEstado(1, 'RESUELTO');

      expect(ticketMock.estado).toBe('RESUELTO');
      expect(ticketMock.fechaCierre).toBeInstanceOf(Date);
      expect(ticketMock.save).toHaveBeenCalled();
    });

    it('debe fallar si el estado no es valido', async () => {
      await expect(ticketService.cambiarEstado(1, 'PAUSADO'))
        .rejects
        .toThrow('El estado no es valido');
    });

    it('debe fallar si el ticket no existe', async () => {
      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(null);

      await expect(ticketService.cambiarEstado(999, 'EN_PROCESO'))
        .rejects
        .toThrow('Ticket no encontrado');
    });

    it('debe fallar si la transicion de estado no es valida', async () => {
      const ticketMock = {
        id: 1,
        estado: 'ABIERTO',
        save: vi.fn()
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(ticketMock);

      await expect(ticketService.cambiarEstado(1, 'CERRADO'))
        .rejects
        .toThrow('No se puede cambiar de ABIERTO a CERRADO');
    });
  });

  describe('asignarTicket', () => {
    it('debe asignar un ticket a un agente valido', async () => {
      const ticketMock = {
        id: 1,
        estado: 'ABIERTO',
        agenteAsignadoId: null,
        save: vi.fn().mockResolvedValue()
      };

      const agenteMock = {
        id: 2,
        activo: true,
        Rol: {
          nombre: 'AGENTE_SOPORTE'
        }
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(ticketMock);
      vi.spyOn(Usuario, 'findByPk').mockResolvedValue(agenteMock);

      const resultado = await ticketService.asignarTicket(1, 2);

      expect(Usuario.findByPk).toHaveBeenCalledWith(2, {
        include: [{ model: Rol, attributes: ['nombre'] }]
      });

      expect(ticketMock.agenteAsignadoId).toBe(2);
      expect(ticketMock.save).toHaveBeenCalled();
      expect(resultado).toBe(ticketMock);
    });

    it('debe fallar si el ticket no existe', async () => {
      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(null);

      await expect(ticketService.asignarTicket(999, 2))
        .rejects
        .toThrow('Ticket no encontrado');
    });

    it('debe fallar si el ticket esta cerrado', async () => {
      const ticketMock = {
        id: 1,
        estado: 'CERRADO'
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(ticketMock);

      await expect(ticketService.asignarTicket(1, 2))
        .rejects
        .toThrow('No se puede asignar un ticket cerrado');
    });

    it('debe fallar si el agente no existe', async () => {
      const ticketMock = {
        id: 1,
        estado: 'ABIERTO'
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(ticketMock);
      vi.spyOn(Usuario, 'findByPk').mockResolvedValue(null);

      await expect(ticketService.asignarTicket(1, 999))
        .rejects
        .toThrow('Agente no encontrado');
    });

    it('debe fallar si el agente esta inactivo', async () => {
      const ticketMock = {
        id: 1,
        estado: 'ABIERTO'
      };

      const agenteMock = {
        id: 2,
        activo: false,
        Rol: {
          nombre: 'AGENTE_SOPORTE'
        }
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(ticketMock);
      vi.spyOn(Usuario, 'findByPk').mockResolvedValue(agenteMock);

      await expect(ticketService.asignarTicket(1, 2))
        .rejects
        .toThrow('El agente esta inactivo');
    });

    it('debe fallar si el usuario no tiene rol valido para atender tickets', async () => {
      const ticketMock = {
        id: 1,
        estado: 'ABIERTO'
      };

      const usuarioMock = {
        id: 3,
        activo: true,
        Rol: {
          nombre: 'USUARIO'
        }
      };

      vi.spyOn(Ticket, 'findByPk').mockResolvedValue(ticketMock);
      vi.spyOn(Usuario, 'findByPk').mockResolvedValue(usuarioMock);

      await expect(ticketService.asignarTicket(1, 3))
        .rejects
        .toThrow('El usuario no tiene rol valido para atender tickets');
    });
  });
});