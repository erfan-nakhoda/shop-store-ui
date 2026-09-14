import { Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatToman } from '../lib/format'

import { Link } from 'react-router-dom'
import { ProductImage } from './ProductImage'
import { entityId, productImage } from '../lib/catalog'

export function ProductCard({ product }) {
  const { addToBasket } = useApp()
  const image = productImage(product)
  const href = `/products/${encodeURIComponent(entityId(product))}`

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-glow">
      <Link to={href} aria-label={product.name || product.title} className="relative block aspect-[4/4.2] overflow-hidden bg-slate-100">
        <ProductImage src={image} name={product.name} />
      </Link>
      <div className="p-4">
        <p className="mb-1 text-xs font-medium text-cyan-700">{product.category?.name || (typeof product.category === 'string' ? product.category : '') || 'پوشاک'}</p>
        <h3 className="min-h-12 font-semibold leading-5 text-slate-900"><Link to={href}>{product.name || product.title}</Link></h3>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="font-bold">{product.price != null ? formatToman(product.price) : 'قیمت اعلام نشده'}</span>
          </div>
          <button onClick={() => addToBasket(product)} className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white transition hover:bg-cyan-600" aria-label={`افزودن ${product.name} به سبد خرید`}>
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  )
}
