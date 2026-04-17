import { test, expect } from '@playwright/test';
import {
  crearUsuario,
  listarUsuarios,
  obtenerUsuarioPorId,
  cambiarEstadoUsuario
} from '../services/usuarios.service.js';
import {
  usuarioValido,
  usuarioEmailInvalido,
  usuarioSinCampos
} from '../data/usuarios.data.js';

test.describe('API Usuarios', () => {
  test('debe crear un usuario correctamente', async ({ request }) => {
    let response;
    let body;

    await test.step('Enviar request para crear usuario', async () => {
      response = await crearUsuario(request, usuarioValido);
    });

    await test.step('Validar status 201', async () => {
      expect(response.status()).toBe(201);
    });

    await test.step('Validar body de respuesta', async () => {
      body = await response.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('nombre', usuarioValido.nombre);
      expect(body).toHaveProperty('email', usuarioValido.email.toLowerCase());
      expect(body).not.toHaveProperty('password');
    });
  });

  test('debe fallar si el email es invalido', async ({ request }) => {
    const response = await crearUsuario(request, usuarioEmailInvalido);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).toHaveProperty('message');
  });

  test('debe fallar si faltan campos obligatorios', async ({ request }) => {
    const response = await crearUsuario(request, usuarioSinCampos);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).toHaveProperty('message');
  });

  test('debe listar usuarios', async ({ request }) => {
    const response = await listarUsuarios(request);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test('debe obtener un usuario por id', async ({ request }) => {
    const crearResponse = await crearUsuario(request, {
      ...usuarioValido,
      email: `usuario.obtener.${Date.now()}@test.com`
    });
    const usuarioCreado = await crearResponse.json();

    const response = await obtenerUsuarioPorId(request, usuarioCreado.id);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('id', usuarioCreado.id);
  });

  test('debe cambiar el estado de un usuario', async ({ request }) => {
    const crearResponse = await crearUsuario(request, {
      ...usuarioValido,
      email: `usuario.estado.${Date.now()}@test.com`
    });
    const usuarioCreado = await crearResponse.json();

    const response = await cambiarEstadoUsuario(request, usuarioCreado.id, false);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('activo', false);
  });
});