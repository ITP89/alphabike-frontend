import { createContext, useContext, useState, useEffect } from 'react'

const CarritoContext = createContext(null)

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(() => {
    const guardado = localStorage.getItem('carrito')
    return guardado ? JSON.parse(guardado) : []
  })

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items))
  }, [items])

  function agregarProducto(producto, cantidad = 1) {
    setItems((prev) => {
      const existente = prev.find((item) => item.id === producto.id)
      if (existente) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: Math.min(item.cantidad + cantidad, producto.stock) }
            : item
        )
      }
      return [...prev, { ...producto, cantidad }]
    })
  }

  function actualizarCantidad(productoId, cantidad) {
    if (cantidad < 1) return
    setItems((prev) =>
      prev.map((item) =>
        item.id === productoId ? { ...item, cantidad } : item
      )
    )
  }

  function eliminarProducto(productoId) {
    setItems((prev) => prev.filter((item) => item.id !== productoId))
  }

  function vaciarCarrito() {
    setItems([])
  }

  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0)

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