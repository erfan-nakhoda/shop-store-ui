import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productsApi, getApiMessage } from '../lib/api'
import { readProduct, productImage, validHex } from '../lib/catalog'
import { ProductImage } from '../components/ProductImage'
import { useApp } from '../context/AppContext'
import { formatToman } from '../lib/format'

export function ProductDetailsPage() {
  const { id } = useParams()
  const { addToBasket, basketError } = useApp()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setProduct(null); setError('')
    productsApi.get(id, { signal: controller.signal }).then(({ data }) => {
      if (!controller.signal.aborted) setProduct(readProduct(data, id))
    }).catch(error => { if (!controller.signal.aborted) setError(getApiMessage(error)) })
      .finally(() => !controller.signal.aborted && setLoading(false))
    return () => controller.abort()
  }, [id])
  const extraDetails = Object.entries(product?.details || product?.attributes || {}).filter(([, value]) => ['string', 'number'].includes(typeof value))
  return <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <Link to="/products" className="font-semibold text-cyan-700">بازگشت به محصولات</Link>
    {loading && <p role="status" className="py-12">در حال بارگذاری…</p>}
    {error && <p role="alert" className="mt-6 rounded-2xl bg-rose-50 p-6 text-rose-700">{error}</p>}
    {product && <div className="mt-6 grid gap-8 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100"><ProductImage src={productImage(product)} name={product.name} /></div>
      <div><p className="text-cyan-700">{product.category?.name}</p><h1 className="mt-2 text-3xl font-bold">{product.name || product.title}</h1>
        {product.description && <p className="mt-5 whitespace-pre-line leading-8 text-slate-600">{product.description}</p>}
        <dl className="mt-6 space-y-4">
          <div><dt className="text-sm text-slate-500">رنگ</dt><dd className="mt-1 inline-flex items-center gap-2"><span aria-label={validHex(product.color_hex) ? `Color ${product.color_hex}` : 'Color unavailable'} className="h-7 w-7 rounded-full border border-slate-300" style={{ backgroundColor: validHex(product.color_hex) ? product.color_hex : 'transparent' }} />{product.color || 'مشخص نشده'}{validHex(product.color_hex) && <code dir="ltr" className="text-xs text-slate-500">{product.color_hex}</code>}</dd></div>
          <div><dt className="text-sm text-slate-500">سایز</dt><dd>{Array.isArray(product.sizes) ? product.sizes.join('، ') : product.size || 'مشخص نشده'}</dd></div>
          {(product.total_count ?? product.stock) != null && <div><dt className="text-sm text-slate-500">موجودی</dt><dd>{product.total_count ?? product.stock}</dd></div>}
          {extraDetails.map(([label, value]) => <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd>{value}</dd></div>)}
        </dl>
        {product.price != null && <p className="mt-6 text-xl font-bold">{formatToman(product.price)}</p>}
        <button disabled={adding || Number(product.total_count ?? product.stock) === 0} onClick={async () => { setAdding(true); try { await addToBasket(product) } finally { setAdding(false) } }} className="mt-6 rounded-xl bg-ink px-6 py-3 font-semibold text-white disabled:opacity-50">{adding ? 'در حال افزودن…' : 'افزودن به سبد خرید'}</button>
        {basketError && <p role="alert" className="mt-3 text-rose-700">{basketError}</p>}
      </div>
    </div>}
  </section>
}
