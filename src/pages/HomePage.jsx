import { ArrowRight, Compass, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ProductCard } from '../components/ProductCard'
import { getApiMessage, productsApi } from '../lib/api'

import { readCollection } from '../lib/catalog'

export function HomePage() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    productsApi.list().then(({ data }) => {
      setProducts(readCollection(data).items)
    }).catch((err) => setError(getApiMessage(err)))
  }, [])
  return (
    <>
      <section className="overflow-hidden bg-ink">
        <div className="mx-auto grid min-h-[500px] max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_.9fr] md:py-16">
          <div className="relative z-10 animate-fade-up">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-sm text-cyan-200"><Sparkles size={15} /> برای روزهای پرجنب‌وجوش</p>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-white sm:text-6xl">لباس خوب. <span className="text-cyan-300">بدون پیچیدگی.</span></h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-slate-300 sm:text-lg">منتخبی ساده و کاربردی از لباس‌های راحت؛ برای روزهایی که می‌سازید، حرکت می‌کنید و اثر می‌گذارید.</p>
            <Link to="/products" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-aqua">
              مشاهده فروشگاه <ArrowRight className="rotate-180" size={17} />
            </Link>
          </div>
          <div className="relative mx-auto grid w-full max-w-sm place-items-center">
            <div className="absolute h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="relative animate-float rounded-[2.5rem] border border-cyan-300/25 bg-gradient-to-br from-cyan-500/15 to-blue-500/5 p-6 shadow-2xl">
              <img src="/captain-dev-wheel.png" fetchPriority="high" decoding="async" className="h-72 w-72 rounded-3xl object-cover" alt="Captain Dev Shop mark" />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div><p className="text-sm font-semibold text-cyan-700">تازه رسیده‌ها</p><h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">برای استایل هر روز شما</h2></div>
          <Link to="/products" className="text-sm font-semibold text-cyan-700 hover:text-cyan-900">مشاهده همه</Link>
        </div>
        {error ? <p className="rounded-2xl bg-rose-50 p-8 text-center text-rose-700">{error}</p> : products.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((product) => <ProductCard product={product} key={product.id} />)}</div> : <p className="rounded-2xl bg-white p-8 text-center text-slate-500">محصولی پیدا نشد.</p>}
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6">
        <Feature icon={<Compass />} title="پیدا کردن آسان" text="در میان لباس‌های مورد علاقه‌تان راحت جست‌وجو کنید." />
        <Feature icon={<ShieldCheck />} title="ورود امن" text="APIهای محافظت‌شده NestJS شما همچنان امن می‌مانند." />
        <Feature icon={<Sparkles />} title="ساده و خوش‌ساخت" text="انتخابی تمیز و تجربه‌ای آرام برای خرید." />
      </section>
    </>
  )
}

function Feature({ icon, title, text }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-3 text-cyan-600">{icon}</div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{text}</p></div>
}
