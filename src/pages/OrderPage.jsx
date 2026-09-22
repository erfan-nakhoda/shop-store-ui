import { ArrowRight, LoaderCircle } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ordersApi, getApiMessage } from '../lib/api'
import { useApp } from '../context/AppContext'
import { formatToman } from '../lib/format'

const statusNames = { PENDING: 'در انتظار بررسی', CONFIRMED: 'تأیید شده', PROCESSING: 'در حال آماده‌سازی', SHIPPED: 'ارسال شده', DELIVERED: 'تحویل شده', CANCELLED: 'لغو شده' }

export function OrderPage() {
  const { user } = useApp()
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    setLoading(true); setOrder(null); setError('')
    if (!user) return
    ordersApi.get(id).then(({ data }) => {
      if (active) { const value = data?.data ?? data; setOrder(value?.order || value) }
    }).catch(err => { if (active) setError(getApiMessage(err)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, user])
  if (!user) return <Navigate to="/auth" replace />
  const status = String(order?.status || order?.state || '').toUpperCase()
  const items = Array.isArray(order) ? order : Array.isArray(order?.items) ? order.items : order?.product_name != null || order?.product ? [order] : []
  return <section dir="rtl" className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
    <Link to="/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700"><ArrowRight size={16} /> بازگشت</Link>
    <h1 className="mt-5 text-3xl font-bold">جزئیات سفارش</h1>
    {loading && <p role="status" className="mt-8 flex items-center gap-2 text-slate-500"><LoaderCircle className="animate-spin" size={18} /> در حال بارگذاری…</p>}
    {error && <p role="alert" className="mt-6 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>}
    {order && <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div><p className="text-sm text-slate-500">شماره سفارش</p><p className="mt-1 text-xl font-bold">{order.orderNumber || order.code || order.id || id}</p></div>
        <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800">{statusNames[status] || order.status || order.state || 'نامشخص'}</span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Info label="مبلغ نهایی" value={order.total != null || order.totalPrice != null ? formatToman(order.total ?? order.totalPrice) : '—'} />
        <Info label="تاریخ ثبت" value={order.created_at || order.createdAt || '—'} />
      </div>
      <div className="mt-6 border-t border-slate-100 pt-5">
        <h2 className="font-semibold">اقلام سفارش</h2>
        {items.length === 0 ? <p className="mt-3 text-slate-500">اقلام سفارش موجود نیست.</p> : <ul className="mt-3 divide-y divide-slate-100">
          {items.map((item, index) => <li key={item.id ?? index} className="grid gap-3 py-4 sm:grid-cols-2">
            <Info label="نام محصول" value={item.product_name ?? item.product?.name ?? item.name ?? '—'} />
            <Info label="تعداد" value={item.count ?? item.quantity ?? '—'} />
            <Info label="رنگ" value={item.color ?? item.product?.color ?? '—'} />
            <Info label="قیمت واحد" value={item.product?.price != null || item.price != null ? formatToman(item.product?.price ?? item.price) : '—'} />
          </li>)}
        </ul>}
      </div>
    </div>}
  </section>
}

function Info({ label, value }) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div> }
