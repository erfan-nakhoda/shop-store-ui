import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatToman } from '../lib/format'
import { getApiMessage, ordersApi } from '../lib/api'

export function BasketPage() {
  const { basket, basketError, basketTotal, updateQuantity, removeFromBasket, clearBasket } = useApp()
  const navigate = useNavigate()
  const [ordering, setOrdering] = useState(false)
  const [orderError, setOrderError] = useState('')
  const createOrder = async () => {
    if (ordering) return
    setOrdering(true); setOrderError('')
    try {
      const { data } = await ordersApi.set()
      clearBasket()
      const value = data?.data ?? data
      const id = value?.id || value?.orderId || value?.order?.id
      navigate(id ? `/order/${encodeURIComponent(id)}` : '/profile')
    } catch (error) { setOrderError(getApiMessage(error)) }
    finally { setOrdering(false) }
  }
  if (!basket.length) return <section className="mx-auto grid min-h-[58vh] max-w-7xl place-items-center px-4 text-center">
    <div><div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-cyan-100 text-cyan-700"><ShoppingBag /></div><h1 className="text-3xl font-bold">سبد خریدتان منتظر شماست.</h1><p className="mt-2 text-slate-500">چند انتخاب خوب اضافه کنید تا اینجا ببینیدشان.</p><Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 font-semibold text-white">مشاهده محصولات <ArrowRight className="rotate-180" size={16} /></Link></div>
  </section>

  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
    <h1 className="text-3xl font-bold tracking-tight">سبد خرید <span className="text-slate-400">({basket.length})</span></h1>
    {basketError && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{basketError}</p>}
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-3">
        {basket.map((item) => <article key={item.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
          <div className="grid h-24 w-20 shrink-0 place-items-center overflow-hidden rounded-xl" style={{ background: `linear-gradient(145deg, ${item.color || '#0e7490'}, #07111f)` }}><img src={item.image || item.imageUrl || '/captain-dev-wheel.png'} alt="" className="h-full w-full object-contain p-2" /></div>
          <div className="min-w-0 flex-1"><p className="text-xs font-medium text-cyan-700">{item.category?.name || item.category || 'پوشاک'}</p><h2 className="truncate font-semibold">{item.name}</h2><p className="mt-2 font-bold">{formatToman(item.price)}</p></div>
          <div className="flex flex-col items-end justify-between"><button onClick={() => removeFromBasket(item.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={17} /></button><div className="flex items-center rounded-lg bg-slate-100"><button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2"><Minus size={14} /></button><span className="w-7 text-center text-sm font-semibold">{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2"><Plus size={14} /></button></div></div>
        </article>)}
      </div>
      <aside className="h-fit rounded-3xl bg-ink p-6 text-white">
        <h2 className="text-lg font-semibold">خلاصه سفارش</h2>
        <div className="mt-5 space-y-3 border-b border-white/10 pb-5 text-sm text-slate-300"><p className="flex justify-between"><span>جمع کالاها</span><span>{formatToman(basketTotal)}</span></p><p className="flex justify-between"><span>ارسال</span><span className="text-cyan-300">رایگان</span></p></div>
        <p className="mt-5 flex justify-between text-lg font-bold"><span>مبلغ نهایی</span><span>{formatToman(basketTotal)}</span></p>
        {orderError && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{orderError}</p>}
        <button onClick={createOrder} disabled={ordering} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-ink transition hover:bg-aqua disabled:opacity-60">{ordering ? 'در حال ثبت سفارش…' : 'ادامه و پرداخت'} <ArrowRight className="rotate-180" size={17} /></button>
        <p className="mt-3 text-center text-xs text-slate-400">مرحله پرداخت را می‌توان به API سفارش‌ها متصل کرد.</p>
      </aside>
    </div>
  </section>
}
