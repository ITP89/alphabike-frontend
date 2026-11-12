export function getAccionPedido(pedido) {
  if (pedido.estado === 'PAGADO') return { estado: 'EN_PREPARACION', label: 'Iniciar preparación' }
  if (pedido.estado === 'EN_PREPARACION') {
    if (pedido.tipoEntrega === 'RECOJO_TIENDA') return { estado: 'LISTO_PARA_RECOJO', label: 'Listo para recojo' }
    if (pedido.tipoEntrega === 'DELIVERY_LIMA') return { estado: 'EN_CAMINO', label: 'Enviar a domicilio' }
    if (pedido.tipoEntrega === 'ENVIO_PROVINCIA') return { guia: true, label: 'Registrar envío' }
  }
  if (['LISTO_PARA_RECOJO', 'EN_CAMINO', 'ENVIADO'].includes(pedido.estado)) return { estado: 'ENTREGADO', label: 'Marcar entregado' }
  return null
}
