import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { useCarrito } from '../context/CarritoContext'

function DetalleProducto() {
    const { id } = useParams()
    const { agregarProducto } = useCarrito()
    const [agregado, setAgregado] = useState(false)
    const [producto, setProducto] = useState(null)
    const [cantidad, setCantidad] = useState(1)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function cargarProducto() {
            try {
                const response = await api.get(`/productos/${id}`)
                setProducto(response.data.data)
            } catch (err) {
                setError('No se pudo cargar el producto')
            } finally {
                setCargando(false)
            }
        }

        cargarProducto()
    }, [id])

    if (cargando) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <p className="text-center text-gray-500 py-10">Cargando producto...</p>
            </div>
        )
    }

    if (error || !producto) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <p className="text-center text-red-600 py-10">{error || 'Producto no encontrado'}</p>
            </div>
        )
    }

    function handleAgregarCarrito() {
        agregarProducto(producto, cantidad)
        setAgregado(true)
        setTimeout(() => setAgregado(false), 2000)
    }

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="px-6 py-3 border-b border-gray-200 text-sm text-gray-500 max-w-6xl mx-auto">
                Inicio &gt; Tienda &gt; {producto.categoriaNombre} &gt; {producto.nombre}
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Galeria */}
                <div>
                    <div className="bg-gray-100 h-72 rounded-lg flex items-center justify-center text-gray-400 mb-3">
                        📷
                    </div>
                </div>

                {/* Info */}
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-1">{producto.nombre}</h1>
                    <p className="text-gray-500 text-sm mb-2">
                        Marca: {producto.marca} | Categoria: {producto.categoriaNombre}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 mb-3">
                        S/ {producto.precio.toFixed(2)}
                    </p>

                    <span
                        className={`inline-block text-xs px-2 py-1 rounded-md mb-4 ${producto.stock > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {producto.stock > 0 ? `En stock (${producto.stock})` : 'Sin stock'}
                    </span>

                    <p className="text-gray-600 text-sm mb-6">
                        {producto.descripcion || 'Sin descripcion disponible.'}
                    </p>

                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-sm text-gray-700">Cantidad:</span>
                        <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                                className="px-3 py-1"
                            >
                                -
                            </button>
                            <span className="px-3 py-1">{cantidad}</span>
                            <button
                                onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))}
                                className="px-3 py-1"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={handleAgregarCarrito}
                            disabled={producto.stock === 0}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                            {agregado ? 'Agregado ✓' : 'Agregar al carrito'}
                        </button>
                        <button
                            disabled={producto.stock === 0}
                            className="flex-1 bg-gray-900 text-white py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-50"
                        >
                            Comprar ahora
                        </button>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-gray-900 text-sm font-medium mb-1">Informacion de entrega</p>
                        <p className="text-gray-500 text-sm">Recojo en tienda, delivery Lima o envio a provincia</p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default DetalleProducto