export async function crearTicket(request, data) {
  return await request.post('/api/v1/tickets', {
    data
  });
}

export async function listarTickets(request, filtros = {}) {
  return await request.get('/api/v1/tickets', {
    params: filtros
  });
}

export async function obtenerTicketPorId(request, id) {
  return await request.get(`/api/v1/tickets/${id}`);
}

export async function cambiarEstadoTicket(request, id, estado) {
  return await request.patch(`/api/v1/tickets/${id}/estado`, {
    data: { estado }
  });
}

export async function asignarTicket(request, id, agenteId) {
  return await request.patch(`/api/v1/tickets/${id}/asignar`, {
    data: { agenteId }
  });
}