import { createContext, useContext, useState, useEffect } from 'react'

const CarritoContext = createContext(null)

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(() => {
    const guardado = localStorage.getItem('carrito')
    if (!guardado) return []

    try {
      return JSON.parse(guardado)
    } catch {
      localStorage.removeItem('carrito')
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items))
  }, [items])

  function agregarProducto(producto, cantidad = 1) {
    if (!producto.stock || producto.stock < 1) return

    setItems((prev) => {
      const existente = prev.find((item) => item.id === producto.id)
      const cantidadSegura = Math.min(cantidad, producto.stock)
      if (existente) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: Math.min(item.cantidad + cantidadSegura, producto.stock) }
            : item
        )
      }
      return [...prev, { ...producto, cantidad: cantidadSegura }]
    })
  }

  function actualizarCantidad(productoId, cantidad) {
    if (cantidad < 1) return
    setItems((prev) =>
      prev.map((item) =>
        item.id === productoId ? { ...item, cantidad: Math.min(cantidad, item.stock) } : item
      )
    )
  }

  function eliminarProducto(productoId) {
    setItems((prev) => prev.filter((item) => item.id !== productoId))
  }

  function vaciarCarrito() {
    setItems([])
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.precio || 0) * Number(item.cantidad || 0), 0)
  const totalItems = items.reduce((sum, item) => sum + Number(item.cantidad || 0), 0)

  return (
    <CarritoContext.Provider
      value={{
        items,
        agregarProducto,
        actualizarCantidad,
        eliminarProducto,
        vaciarCarrito,
        subtotal,
        totalItems,
      }}
    >
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  return useContext(CarritoContext)
}
