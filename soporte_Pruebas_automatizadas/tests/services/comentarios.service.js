export async function crearComentario(request, ticketId, data) {
  return await request.post(`/api/v1/tickets/${ticketId}/comentarios`, {
    data
  });
}

export async function listarComentariosPorTicket(request, ticketId) {
  return await request.get(`/api/v1/tickets/${ticketId}/comentarios`);
}