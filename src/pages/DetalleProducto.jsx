import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Clock,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Wrench,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import ImageFallback from '../components/ui/ImageFallback'
import { useCarrito } from '../context/CarritoContext'
import { useApiGet } from '../hooks/useApiGet'
import { classNames, formatMoney } from '../utils/formatters'

function DetalleProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { agregarProducto } = useCarrito()
  const { data: producto, loading, error, refetch } = useApiGet(`/productos/${id}`, null, 'No se pudo cargar el producto')
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <LoadingState text="Cargando producto..." />
        </main>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <ErrorState message={error || 'Producto no encontrado'} onRetry={refetch} />
        </main>
      </div>
    )
  }

  const stockDisponible = Number(producto.stock || 0)
  const sinStock = stockDisponible < 1
  const categoria = producto.categoriaNombre || 'Producto'
  const marca = producto.marca || 'AlphaBike'
  const descripcion = producto.descripcion || 'Producto seleccionado por AlphaBike Workshop para ciclistas que buscan rendimiento, seguridad y soporte técnico confiable.'

  const beneficios = [
    {
      icon: BadgeCheck,
      label: 'Stock verificado',
      detail: sinStock ? 'Consulta disponibilidad' : `${stockDisponible} unidad${stockDisponible === 1 ? '' : 'es'} lista${stockDisponible === 1 ? '' : 's'}`,
    },
    {
      icon: Wrench,
      label: 'Asesoría de taller',
      detail: 'Te ayudamos a elegir compatible',
    },
    {
      icon: ShieldCheck,
      label: 'Compra segura',
      detail: 'Garantía y soporte postventa',
    },
  ]

  function handleAgregarCarrito() {
    agregarProducto(producto, cantidad)
    setAgregado(true)
    window.setTimeout(() => setAgregado(false), 2000)
  }

  function handleComprarAhora() {
    agregarProducto(producto, cantidad)
    navigate('/carrito')
  }

  return (
    <div className="min-h-screen bg-[#eeeeef] font-sans text-zinc-950 selection:bg-red-600 selection:text-white">
      <Navbar />

      <section className="border-b border-zinc-200 bg-[linear-gradient(135deg,#f8f8f9_0%,#f1f1f2_48%,#ffe7e7_76%,#e1262f_138%)] text-zinc-950">
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <Link
            to="/tienda"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-950 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver a tienda
          </Link>

          <div className="mt-8 max-w-4xl">
            <p className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-black uppercase text-red-700 shadow-sm">
              <PackageCheck className="h-4 w-4" aria-hidden="true" />
              {categoria}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              {producto.nombre}
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-zinc-700">
              {descripcion}
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto -mt-16 max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
          <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/10">
            <div className="border-b border-zinc-900 bg-[linear-gradient(90deg,#121214_0%,#211619_72%,#e1262f_100%)] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-red-200">Vista del producto</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-300">{marca}</p>
                </div>
                <span className="rounded-md bg-white px-3 py-1 text-xs font-black uppercase text-zinc-950">
                  AlphaBike Pro
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="aspect-[4/3] overflow-hidden rounded-md border border-zinc-200 bg-white">
                <ImageFallback src={producto.imagenUrl} alt={producto.nombre} className="object-contain p-3" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {beneficios.map(({ icon: Icon, label, detail }) => (
                  <div key={label} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                    <Icon className="h-5 w-5 text-red-600" aria-hidden="true" />
                    <p className="mt-2 text-xs font-black uppercase text-zinc-950">{label}</p>
                    <p className="mt-1 text-[11px] font-semibold leading-4 text-zinc-500">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-2xl shadow-zinc-950/10">
            <div className="h-2 bg-[linear-gradient(90deg,#e1262f_0%,#e1262f_38%,#0a0a0b_38%,#0a0a0b_100%)]" />
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <p className="text-xs font-black uppercase text-red-600">{categoria}</p>
                  <p className="mt-1 text-sm font-bold text-zinc-500">{marca}</p>
                </div>
                <span
                  className={classNames(
                    'inline-flex rounded-md px-3 py-1.5 text-xs font-black uppercase',
                    sinStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700',
                  )}
                >
                  {sinStock ? 'Sin stock' : `En stock (${stockDisponible})`}
                </span>
              </div>

              <div className="py-6">
                <p className="text-sm font-bold uppercase text-zinc-500">Precio final</p>
                <p className="mt-1 text-5xl font-black tracking-normal text-zinc-950">{formatMoney(producto.precio)}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  Repuesto listo para compra con atención de taller, validación de compatibilidad y opciones de entrega.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-zinc-200 pt-5">
                <span className="text-sm font-black text-zinc-950">Cantidad</span>
                <div className="flex h-12 items-center overflow-hidden rounded-md border border-zinc-300 bg-zinc-50">
                <button
                  type="button"
                  onClick={() => setCantidad((current) => Math.max(1, current - 1))}
                  disabled={cantidad <= 1 || sinStock}
                    className="flex h-12 w-12 items-center justify-center text-zinc-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                  <span className="min-w-12 text-center text-base font-black text-zinc-950">{cantidad}</span>
                <button
                  type="button"
                    onClick={() => setCantidad((current) => Math.min(stockDisponible, current + 1))}
                    disabled={cantidad >= stockDisponible || sinStock}
                    className="flex h-12 w-12 items-center justify-center text-zinc-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAgregarCarrito}
                disabled={sinStock}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                {agregado ? 'Agregado' : 'Agregar al carrito'}
              </button>
              <button
                type="button"
                onClick={handleComprarAhora}
                disabled={sinStock}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Comprar ahora
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-black text-zinc-950">
                    <Truck className="h-4 w-4 text-red-600" aria-hidden="true" />
                    Información de entrega
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">Recojo en tienda, delivery en Lima o envío a provincia.</p>
                </div>
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-black text-zinc-950">
                    <Clock className="h-4 w-4 text-red-600" aria-hidden="true" />
                    Atención rápida
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">Confirmamos tu compra y disponibilidad para coordinar la entrega.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm shadow-zinc-950/5">
            <p className="text-xs font-black uppercase text-red-600">Detalle técnico</p>
            <h2 className="mt-2 text-2xl font-black text-zinc-950">Descripción del producto</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-600">{descripcion}</p>
          </section>

          <section className="rounded-lg border border-zinc-900 bg-zinc-950 p-6 text-white shadow-sm shadow-zinc-950/10">
            <p className="text-xs font-black uppercase text-red-300">Ficha rápida</p>
            <dl className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-sm font-bold text-zinc-400">Marca</dt>
                <dd className="text-right text-sm font-black text-white">{marca}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-sm font-bold text-zinc-400">Categoría</dt>
                <dd className="text-right text-sm font-black text-white">{categoria}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm font-bold text-zinc-400">Disponibilidad</dt>
                <dd className={classNames('text-right text-sm font-black', sinStock ? 'text-red-300' : 'text-emerald-300')}>
                  {sinStock ? 'Sin stock' : `${stockDisponible} en stock`}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </main>
    </div>
  )
}

export default DetalleProducto
