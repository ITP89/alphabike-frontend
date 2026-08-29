export type RolUsuario = 'ADMIN' | 'ENCARGADO' | 'CLIENTE'

export type EstadoPedido =
  | 'PENDIENTE'
  | 'PAGADO'
  | 'EN_PREPARACION'
  | 'LISTO_PARA_RECOJO'
  | 'EN_CAMINO'
  | 'ENVIADO'
  | 'ENTREGADO'
  | 'CANCELADO'

export type TipoEntrega = 'RECOJO_TIENDA' | 'DELIVERY_LIMA' | 'ENVIO_PROVINCIA'

export interface ProductoApi {
  id: string
  nombre: string
  descripcion?: string
  marca: string
  precio: number
  stock: number
  imagenUrl?: string
  estado: 'ACTIVO' | 'DESCONTINUADO'
  categoriaId: string
  categoriaNombre: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
