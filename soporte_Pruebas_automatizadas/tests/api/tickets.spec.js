import { test, expect } from '@playwright/test';
import {
  crearTicket,
  listarTickets,
  obtenerTicketPorId,
  cambiarEstadoTicket,
  asignarTicket
} from '../services/tickets.service.js';

import {
  ticketValido,
  ticketPrioridadInvalida,
  ticketSinCampos
} from '../data/tickets.data.js';

test.describe('API Tickets', () => {
  test('debe crear un ticket correctamente', async ({ request }) => {
    let response;
    let body;

    await test.step('Enviar request para crear ticket', async () => {
      response = await crearTicket(request, ticketValido);
    });

    await test.step('Validar status 201', async () => {
      expect(response.status()).toBe(201);
    });

    await test.step('Validar body de respuesta', async () => {
      body = await response.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('numeroTicket');
      expect(body).toHaveProperty('estado', 'ABIERTO');
      expect(body).toHaveProperty('titulo', ticketValido.titulo);
    });
  });

  test('debe fallar si la prioridad es invalida', async ({ request }) => {
    const response = await crearTicket(request, ticketPrioridadInvalida);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).toHaveProperty('message');
  });

  test('debe fallar si faltan campos obligatorios', async ({ request }) => {
    const response = await crearTicket(request, ticketSinCampos);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).toHaveProperty('message');
  });

  test('debe listar tickets', async ({ request }) => {
    const response = await listarTickets(request);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test('debe listar tickets filtrados por estado', async ({ request }) => {
    const response = await listarTickets(request, { estado: 'ABIERTO' });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test('debe obtener un ticket por id', async ({ request }) => {
    const crearResponse = await crearTicket(request, {
      ...ticketValido,
      titulo: `Ticket obtener ${Date.now()}`
    });
    const ticketCreado = await crearResponse.json();

    const response = await obtenerTicketPorId(request, ticketCreado.id);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('id', ticketCreado.id);
  });

  test('debe cambiar el estado de un ticket con transicion valida', async ({ request }) => {
    const crearResponse = await crearTicket(request, {
      ...ticketValido,
      titulo: `Ticket estado ${Date.now()}`
    });
    const ticketCreado = await crearResponse.json();

    const response = await cambiarEstadoTicket(request, ticketCreado.id, 'EN_PROCESO');
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('estado', 'EN_PROCESO');
  });

  test('debe fallar si la transicion de estado es invalida', async ({ request }) => {
    const crearResponse = await crearTicket(request, {
      ...ticketValido,
      titulo: `Ticket transicion invalida ${Date.now()}`
    });
    const ticketCreado = await crearResponse.json();

    const response = await cambiarEstadoTicket(request, ticketCreado.id, 'CERRADO');
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).toHaveProperty('message');
  });

  test('debe asignar un ticket a un agente valido', async ({ request }) => {
    const crearResponse = await crearTicket(request, {
      ...ticketValido,
      titulo: `Ticket asignacion ${Date.now()}`
    });
    const ticketCreado = await crearResponse.json();

    const response = await asignarTicket(request, ticketCreado.id, 2);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('agenteAsignadoId', 2);
  });

  test('debe fallar si se asigna a un usuario con rol invalido', async ({ request }) => {
    const crearResponse = await crearTicket(request, {
      ...ticketValido,
      titulo: `Ticket rol invalido ${Date.now()}`
    });
    const ticketCreado = await crearResponse.json();

    const response = await asignarTicket(request, ticketCreado.id, 1);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).toHaveProperty('message');
  });
});