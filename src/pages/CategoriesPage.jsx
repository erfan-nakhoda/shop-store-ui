import { ArrowUpRight, Grid2X2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiMessage, categoriesApi } from '../lib/api'

import { readCollection, entityId } from '../lib/catalog'

export function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    categoriesApi.list().then(({ data }) => {
      setCategories(readCollection(data, 'categories').items)
    }).catch((error) => {
      setCategories([]); setError(getApiMessage(error))
    })
  }, [])

  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
    <p className="text-sm font-semibold text-cyan-700">خرید بر اساس نوع</p>
    <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">دسته‌بندی‌های روزمره.</h1>
    <p className="mt-2 max-w-xl text-slate-500">از اینجا شروع کنید، لباس مورد علاقه‌تان را پیدا کنید و استایل خودتان را بسازید.</p>
    {error && <p className="mt-8 rounded-2xl bg-rose-50 p-8 text-center text-rose-700">{error}</p>}
    {!error && categories.length === 0 && <p className="mt-8 rounded-2xl bg-white p-8 text-center text-slate-500">دسته‌بندی‌ای پیدا نشد.</p>}
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category, index) => (
        <Link key={entityId(category)} to={`/products?category=${encodeURIComponent(entityId(category))}`} className="group relative overflow-hidden rounded-3xl bg-ink p-6 text-white transition hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-cyan-400/15 blur-xl" />
          <Grid2X2 className="relative text-cyan-300" size={23} />
          <p className="relative mt-12 text-xl font-semibold">{category.name}</p>
          <div className="relative mt-3 flex items-center justify-between text-sm text-slate-300"><span>{category.count ?? category.productsCount ?? 0} محصول</span><ArrowUpRight className="rotate-[-90deg] transition group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" size={18} /></div>
          <div className="absolute bottom-0 left-0 h-1 bg-cyan-300" style={{ width: `${55 + index * 10}%` }} />
        </Link>
      ))}
    </div>
  </section>
}
