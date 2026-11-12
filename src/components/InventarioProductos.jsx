import { Edit, Trash2 } from 'lucide-react'
import ImageFallback from './ui/ImageFallback'
import { formatMoney } from '../utils/formatters'

const columns = 'xl:grid-cols-[minmax(200px,2fr)_1fr_1fr_1fr_1fr_1fr_150px]'

function InventarioProductos({ productos, editandoStock, nuevoStock, onNuevoStock, onEditarStock, onGuardarStock, onEditar, onEliminar, retirando }) {
  return (
    <section tabIndex={0} aria-label="Inventario de productos" className="max-w-full rounded-2xl border border-slate-200 bg-white shadow-sm xl:overflow-x-auto">
      <p className="hidden px-5 py-2 text-xs text-slate-500 xl:block">Si no ves todas las columnas, desplázate horizontalmente para acceder a las acciones.</p>
      <div className={`hidden min-w-[1100px] gap-4 rounded-t-2xl bg-slate-900 px-5 py-3 text-xs font-bold text-slate-300 xl:grid ${columns}`}>
        {['Producto', 'Categoría', 'Proveedor', 'Precio', 'Mínimo', 'Stock', 'Acciones'].map(label => <span key={label}>{label}</span>)}
      </div>
      {productos.map(producto => (
        <article key={producto.id} aria-label={producto.nombre} className={`grid grid-cols-2 gap-4 border-t border-slate-200 p-4 text-xs first:border-t-0 xl:min-w-[1100px] xl:items-center xl:px-5 ${columns}`}>
          <div className="col-span-2 flex min-w-0 items-center gap-3 xl:col-span-1">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <ImageFallback src={producto.imagenUrl} alt={producto.nombre} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 break-words">
              <h2 className="font-extrabold text-slate-900">{producto.nombre}</h2>
              <p className="mt-1 text-slate-500">{producto.marca || 'Sin marca'}</p>
              {producto.estado === 'DESCONTINUADO' && (
                <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">Descontinuado</span>
              )}
            </div>
          </div>
          <div className="min-w-0 break-words"><span className="mb-1 block text-slate-500 xl:sr-only">Categoría</span>{producto.categoriaNombre || 'Sin categoría'}</div>
          <div className="min-w-0 break-words"><span className="mb-1 block text-slate-500 xl:sr-only">Proveedor</span>{producto.proveedorNombre || 'Sin proveedor'}</div>
          <div className="min-w-0 break-words font-bold"><span className="mb-1 block font-normal text-slate-500 xl:sr-only">Precio</span>{formatMoney(producto.precio)}</div>
          <div className="min-w-0 break-words font-bold text-red-700"><span className="mb-1 block font-normal text-slate-500 xl:sr-only">Mínimo</span>{formatMoney(producto.precioMinimoVenta ?? producto.precio)}</div>
          <div className="col-span-2 min-w-0 xl:col-span-1">
            <span className="mb-1 block text-slate-500 xl:sr-only">Stock</span>
            {producto.estado === 'DESCONTINUADO' ? (
              <span>{producto.stock} uds</span>
            ) : editandoStock === producto.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <input type="number" min="0" max="2147483647" step="1" aria-label={`Stock de ${producto.nombre}`} value={nuevoStock} onChange={event => onNuevoStock(event.target.value)} className="w-24 rounded-lg border border-slate-300 px-2 py-2" />
                <button type="button" onClick={() => onGuardarStock(producto.id)} className="rounded-lg bg-slate-950 px-3 py-2 font-bold text-white">OK</button>
              </div>
            ) : (
              <button type="button" onClick={() => onEditarStock(producto)} className="rounded-lg bg-slate-100 px-3 py-2 font-bold text-slate-800">{producto.stock} uds</button>
            )}
          </div>
          <div className="col-span-2 flex flex-wrap gap-2 xl:col-span-1">
            {producto.estado === 'DESCONTINUADO' ? <span className="text-slate-500">Fuera del catálogo</span> : <>
            <button type="button" onClick={() => onEditar(producto)} title="Editar producto e imagen" className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 font-bold text-red-700 hover:bg-red-50"><Edit className="h-4 w-4" aria-hidden="true" />Editar</button>
            {onEliminar && <button type="button" disabled={retirando} onClick={() => onEliminar(producto.id)} title="Descontinuar producto" aria-label={`Descontinuar ${producto.nombre}`} className="rounded-xl border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>}
            </>}
          </div>
        </article>
      ))}
      {productos.length === 0 && <p className="p-5 text-sm text-slate-500">No hay productos que coincidan con la búsqueda.</p>}
    </section>
  )
}

export default InventarioProductos
