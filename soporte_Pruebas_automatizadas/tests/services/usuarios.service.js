export async function crearUsuario(request, data) {
  return await request.post('/api/v1/usuarios', {
    data
  });
}

export async function listarUsuarios(request) {
  return await request.get('/api/v1/usuarios');
}

export async function obtenerUsuarioPorId(request, id) {
  return await request.get(`/api/v1/usuarios/${id}`);
}

export async function cambiarEstadoUsuario(request, id, activo) {
  return await request.patch(`/api/v1/usuarios/${id}/estado`, {
    data: { activo }
  });
}