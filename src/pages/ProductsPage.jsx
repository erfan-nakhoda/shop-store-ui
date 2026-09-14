import { LoaderCircle, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ProductCard } from '../components/ProductCard'
import { getApiMessage, productsApi } from '../lib/api'
import { useSearchParams } from 'react-router-dom'
import { readCollection, entityId } from '../lib/catalog'

export function ProductsPage() {
  const [params] = useSearchParams()
  const categoryId = params.get('category')
  const [count, setCount] = useState(0)
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    setProducts([])
    setCount(0)
    const request = categoryId ? productsApi.listByCategory(categoryId, { signal: controller.signal }) : productsApi.list({ signal: controller.signal })
    request.then(({ data }) => {
      if (controller.signal.aborted) return
      const result = readCollection(data)
      setProducts(result.items)
      setCount(result.count)
    }).catch(error => {
      if (!controller.signal.aborted) setError(getApiMessage(error))
    }).finally(() => !controller.signal.aborted && setLoading(false))
    return () => controller.abort()
  }, [categoryId])

  const shownProducts = useMemo(() => 
    products.filter((product) => `${product.name} ${product.category?.name || product.category || ''}`.toLowerCase().includes(submittedQuery.toLowerCase()))
  , [products, submittedQuery])

  const search = (event) => { event.preventDefault(); setSubmittedQuery(query.trim()) }

  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
    <div className="mb-8 animate-fade-up">
      <p className="text-sm font-semibold text-cyan-700">فروشگاه</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">پیدا کردن لباس بعدی‌تان.</h1>
      <p className="mt-2 text-slate-500">محصولات را مستقیماً از بک‌اند خود جست‌وجو کنید.</p>
    </div>
    <form onSubmit={search} className="mb-4 flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <Search className="ml-2 mt-2.5 text-slate-400" size={19} />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی پیراهن، تیشرت، اکسسوری..." className="min-w-0 flex-1 bg-transparent px-1 outline-none placeholder:text-slate-400" />
      <button className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700">جست‌وجو</button>
    </form>
    <div className="mb-7 flex items-center justify-between text-sm">
      <span className="text-slate-500">{shownProducts.length} محصول</span>
      <button className="inline-flex items-center gap-1.5 font-medium text-slate-600"><SlidersHorizontal size={16} /> فیلترها به‌زودی</button>
    </div>
    {loading ? <div className="grid min-h-72 place-items-center text-slate-500"><LoaderCircle className="animate-spin text-cyan-600" /> </div> : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shownProducts.map((product) => <ProductCard product={product} key={entityId(product)} />)}</div>
    )}
    {!loading && error && <p className="rounded-2xl bg-rose-50 p-8 text-center text-rose-700">{error}</p>}
    {!loading && !error && shownProducts.length === 0 && <p className="rounded-2xl bg-white p-8 text-center text-slate-500">محصولی پیدا نشد.</p>}
  </section>
}
