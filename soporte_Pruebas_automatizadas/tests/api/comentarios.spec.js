import { test, expect } from '@playwright/test';
import { crearTicket } from '../services/tickets.service.js';
import {
  crearComentario,
  listarComentariosPorTicket
} from '../services/comentarios.service.js';

import { ticketValido } from '../data/tickets.data.js';
import {
  comentarioInternoValido,
  comentarioExternoValido,
  comentarioTipoInvalido,
  comentarioSinCampos
} from '../data/comentarios.data.js';

test.describe('API Comentarios', () => {
  test('debe crear un comentario interno correctamente', async ({ request }) => {
    let ticketCreado;
    let response;
    let body;

    await test.step('Crear ticket base para comentar', async () => {
      const crearTicketResponse = await crearTicket(request, {
        ...ticketValido,
        titulo: `Ticket comentario interno ${Date.now()}`
      });

      expect(crearTicketResponse.status()).toBe(201);
      ticketCreado = await crearTicketResponse.json();
    });

    await test.step('Enviar request para crear comentario interno', async () => {
      response = await crearComentario(request, ticketCreado.id, comentarioInternoValido);
    });

    await test.step('Validar status 201', async () => {
      expect(response.status()).toBe(201);
    });

    await test.step('Validar body de respuesta', async () => {
      body = await response.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('contenido', comentarioInternoValido.contenido);
      expect(body).toHaveProperty('tipo', 'INTERNO');
      expect(body).toHaveProperty('ticketId', ticketCreado.id);
      expect(body).toHaveProperty('usuarioId', comentarioInternoValido.usuarioId);
    });
  });

  test('debe crear un comentario externo correctamente', async ({ request }) => {
    const crearTicketResponse = await crearTicket(request, {
      ...ticketValido,
      titulo: `Ticket comentario externo ${Date.now()}`
    });

    expect(crearTicketResponse.status()).toBe(201);
    const ticketCreado = await crearTicketResponse.json();

    const response = await crearComentario(request, ticketCreado.id, comentarioExternoValido);
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body).toHaveProperty('tipo', 'EXTERNO');
    expect(body).toHaveProperty('ticketId', ticketCreado.id);
  });

  test('debe fallar si el tipo de comentario es invalido', async ({ request }) => {
    const crearTicketResponse = await crearTicket(request, {
      ...ticketValido,
      titulo: `Ticket comentario tipo invalido ${Date.now()}`
    });

    expect(crearTicketResponse.status()).toBe(201);
    const ticketCreado = await crearTicketResponse.json();

    const response = await crearComentario(request, ticketCreado.id, comentarioTipoInvalido);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).toHaveProperty('error');
  });

  test('debe fallar si faltan campos obligatorios en el comentario', async ({ request }) => {
    const crearTicketResponse = await crearTicket(request, {
      ...ticketValido,
      titulo: `Ticket comentario sin campos ${Date.now()}`
    });

    expect(crearTicketResponse.status()).toBe(201);
    const ticketCreado = await crearTicketResponse.json();

    const response = await crearComentario(request, ticketCreado.id, comentarioSinCampos);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).toHaveProperty('error');
  });

  test('debe listar comentarios de un ticket', async ({ request }) => {
    const crearTicketResponse = await crearTicket(request, {
      ...ticketValido,
      titulo: `Ticket listar comentarios ${Date.now()}`
    });

    expect(crearTicketResponse.status()).toBe(201);
    const ticketCreado = await crearTicketResponse.json();

    const crearComentarioResponse = await crearComentario(request, ticketCreado.id, comentarioInternoValido);
    expect(crearComentarioResponse.status()).toBe(201);

    const response = await listarComentariosPorTicket(request, ticketCreado.id);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test('debe fallar al listar comentarios de un ticket inexistente', async ({ request }) => {
    const response = await listarComentariosPorTicket(request, 999999);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).toHaveProperty('error');
  });
});