export const usuarioValido = {
  nombre: 'Usuario Automatizado',
  email: `usuario.${Date.now()}@test.com`,
  password: '123456',
  rolId: 3
};

export const usuarioEmailInvalido = {
  nombre: 'Usuario Invalido',
  email: 'correo-invalido',
  password: '123456',
  rolId: 3
};

export const usuarioSinCampos = {
  nombre: '',
  email: '',
  password: '',
  rolId: null
};