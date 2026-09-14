import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RoleGuard } from '../components/RoleGuard'
import { adminApi, adminCapabilities as capabilities } from '../lib/adminApi'
import { getApiMessage } from '../lib/api'
import { entityId, readCollection } from '../lib/catalog'

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-cyan-500'
const buttonClass = 'rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40'
const formatPrice = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
const definitions = {
  products: {
    empty: { name: '', price: '', total_count: '', color: '', categoryId: '', image: '', hex_code: '', size: '' },
    fields: [['name', 'نام محصول', 'text', true], ['price', 'قیمت', 'number', true], ['total_count', 'موجودی', 'number', true], ['color', 'نام رنگ', 'text', true], ['image', 'آدرس تصویر', 'url'], ['hex_code', 'کد رنگ هگز', 'text'], ['size', 'سایز', 'text']],
  },
  categories: {
    empty: { name: '', slug: '', categoryId: '' },
    fields: [['name', 'نام دسته‌بندی', 'text', true], ['slug', 'شناسه انگلیسی', 'text', true]],
  },
  support: {
    empty: { name: '', phone: '', siteIds: [], active: true },
    fields: [['name', 'نام', 'text', true], ['phone', 'شماره موبایل', 'tel', true]],
  },
}

export function AdminPage() {
  return <RoleGuard roles={['ADMIN', 'SUPERADMIN']}><ManagementPage title="پنل مدیریت" allowCategories /></RoleGuard>
}

export function ManagementPage({ title, allowCategories = false }) {
  const [tab, setTab] = useState('products')
  return <section dir="rtl" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <p className="text-sm font-semibold text-cyan-700">مدیریت فروشگاه</p>
    <h1 className="mt-1 text-3xl font-bold">{title}</h1>
    <div className="my-6 flex flex-wrap gap-2" aria-label="Management sections">
      {(allowCategories ? ['products', 'categories', 'support', 'orders'] : ['products', 'orders']).map(key => <button key={key} onClick={() => setTab(key)} aria-pressed={tab === key} className={`rounded-xl px-5 py-3 ${tab === key ? 'bg-ink text-white' : 'bg-white text-slate-700'}`}>{({ products: 'محصولات', categories: 'دسته‌بندی‌ها', support: 'کاربران پشتیبان', orders: 'سفارش‌های مشتریان' })[key]}</button>)}
    </div>
    <ResourceManager key={tab} kind={tab} allowManage={allowCategories} />
  </section>
}

function OrdersManager() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true)
    adminApi.orders.list().then(({ data }) => { if (active) setOrders(readCollection(data, 'orders').items) }).catch(error => { if (active) setError(getApiMessage(error)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [revision])
  const statusNames = { PENDING: 'در انتظار بررسی', CONFIRMED: 'تأیید شده', PROCESSING: 'در حال آماده‌سازی', SHIPPED: 'ارسال شده', DELIVERED: 'تحویل شده', CANCELLED: 'لغو شده' }
  return <div className="rounded-3xl border border-slate-200 bg-white p-6">
    <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold">سفارش‌های مشتریان</h2><p className="mt-1 text-sm text-slate-500">وضعیت سفارش‌ها از API دریافت می‌شود.</p></div><button onClick={() => setRevision(value => value + 1)} className="text-sm font-semibold text-cyan-700">به‌روزرسانی</button></div>
    {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>}
    {loading ? <p role="status">در حال بارگذاری…</p> : orders.length === 0 ? <p className="text-slate-500">سفارشی پیدا نشد.</p> : <div className="overflow-x-auto"><table className="w-full text-right text-sm"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="p-3">شماره سفارش</th><th className="p-3">مشتری</th><th className="p-3">مبلغ</th><th className="p-3">وضعیت</th></tr></thead><tbody>{orders.map(order => <tr key={entityId(order)} className="border-b border-slate-100"><td className="p-3 font-semibold">{order.orderNumber || order.code || entityId(order)}</td><td className="p-3">{order.user?.phone || order.customer?.phone || order.user?.name || order.customer?.name || '—'}</td><td className="p-3">{order.total ?? order.totalPrice ?? '—'}</td><td className="p-3"><span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-800">{statusNames[String(order.status || order.state || 'PENDING').toUpperCase()] || order.status || order.state || 'نامشخص'}</span></td></tr>)}</tbody></table></div>}
  </div>
}

function ResourceManager({ kind, allowManage }) {
  if (kind === 'orders') return <OrdersManager />
  const definition = definitions[kind]
  const [form, setForm] = useState({ ...definition.empty })
  const [editing, setEditing] = useState(null)
  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [revision, setRevision] = useState(0)
  const [deleting, setDeleting] = useState(null)
  const canList = kind !== 'support' || capabilities.supportList
  const canCreate = kind !== 'support' || (capabilities.supportCreate && capabilities.sitesList)
  const canUpdate = allowManage && (kind === 'categories' || capabilities[kind === 'products' ? 'productUpdate' : 'supportUpdate']) && (kind !== 'support' || capabilities.sitesList)
  const canDelete = allowManage && (kind === 'categories' || capabilities[kind === 'products' ? 'productDelete' : 'supportDelete'])

  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    const jobs = [
      canList ? adminApi[kind].list().then(({ data }) => { if (active) setRows(readCollection(data, kind === 'support' ? 'users' : kind).items) }) : Promise.resolve(),
      kind !== 'support' ? adminApi.categories.list().then(({ data }) => { if (active) setCategories(readCollection(data, 'categories').items) }) : Promise.resolve(),
      kind === 'support' && capabilities.sitesList ? adminApi.sites.list().then(({ data }) => { if (active) setSites(readCollection(data, 'sites').items) }) : Promise.resolve(),
    ]
    Promise.allSettled(jobs).then(results => {
      if (!active) return
      setError(results.filter(result => result.status === 'rejected').map(result => getApiMessage(result.reason)).join(' '))
      setLoading(false)
    })
    return () => { active = false }
  }, [kind, revision, canList])

  const reset = () => { setEditing(null); setForm({ ...definition.empty }) }
  const change = (key, value) => setForm(previous => ({ ...previous, [key]: value }))
  const startEdit = row => {
    setEditing(row); setStatus(''); setError('')
    setForm(Object.fromEntries(Object.entries(definition.empty).map(([key, fallback]) => [key, key === 'price' ? formatPrice(row[key]) : row[key] ?? fallback])))
  }
  const submit = async event => {
    event.preventDefault()
    if (saving || !(editing ? canUpdate : canCreate)) return
    setSaving(true); setError(''); setStatus('')
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== '').map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]))
      if (kind === 'support') payload.role = 'support'
      if (editing) await adminApi[kind].update(kind === 'categories' ? editing.slug : entityId(editing), payload)
      else await adminApi[kind].create(payload)
      reset(); setStatus(editing ? 'تغییرات با موفقیت ذخیره شد.' : 'با موفقیت ایجاد شد.'); setRevision(value => value + 1)
    } catch (error) { setError(getApiMessage(error)) }
    finally { setSaving(false) }
  }
  const remove = async () => {
    if (!deleting || !canDelete || saving) return
    setSaving(true); setError(''); setStatus('')
    try {
      await adminApi[kind].remove(kind === 'categories' ? deleting.slug : entityId(deleting))
      if (editing && entityId(editing) === entityId(deleting)) reset()
      setDeleting(null); setStatus('با موفقیت حذف شد.'); setRevision(value => value + 1)
    } catch (error) { setError(getApiMessage(error)) }
    finally { setSaving(false) }
  }

  return <div>
        {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>}
    {status && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-4 text-emerald-800">{status}</p>}
    {(!canList || !canCreate || (allowManage && (!canUpdate || !canDelete))) && <p className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">برخی امکانات مدیریتی هنوز از طریق API فعال نشده‌اند.</p>}
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="mb-5 text-xl font-semibold">{editing ? 'ویرایش' : 'ایجاد'} {kind === 'categories' ? 'دسته‌بندی' : kind === 'support' ? 'کاربر پشتیبان' : 'محصول'}</h2>
        <fieldset disabled={saving || loading || !(editing ? canUpdate : canCreate)} className="grid gap-4 disabled:opacity-60">
          {definition.fields.map(([key, label, type, required]) => <label key={key} className="grid gap-1.5 text-sm font-medium">{label}<input className={inputClass} type={key === 'price' ? 'text' : type} inputMode={key === 'price' ? 'numeric' : undefined} required={required} min={type === 'number' ? '0' : undefined} step={type === 'number' ? '1' : undefined} pattern={key === 'hex_code' ? '#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})' : undefined} placeholder={key === 'price' ? 'مثلاً 1,250,000' : key === 'hex_code' ? '#facc15' : undefined} value={form[key]} onChange={event => change(key, key === 'price' ? formatPrice(event.target.value) : event.target.value)} /></label>)}
          {kind !== 'support' && <label className="grid gap-1.5 text-sm font-medium">{kind === 'categories' ? 'دسته‌بندی والد (اختیاری)' : 'دسته‌بندی'}<select className={inputClass} required={kind === 'products'} value={form.categoryId} onChange={event => change('categoryId', event.target.value)}><option value="">انتخاب دسته‌بندی</option>{categories.filter(category => kind !== 'categories' || !editing || entityId(category) !== entityId(editing)).map(category => <option key={entityId(category)} value={entityId(category)}>{category.name}</option>)}</select></label>}
          {kind === 'support' && <>
            <fieldset><legend className="mb-2 text-sm font-medium">فروشگاه‌های مجاز</legend>{sites.length === 0 && <p className="text-sm text-slate-500">فروشگاهی وجود ندارد.</p>}{sites.map(site => <label key={entityId(site)} className="flex items-center gap-2 py-1"><input type="checkbox" checked={form.siteIds.map(String).includes(String(entityId(site)))} onChange={event => change('siteIds', event.target.checked ? [...form.siteIds, String(entityId(site))] : form.siteIds.filter(id => String(id) !== String(entityId(site))))} />{site.name || site.domain}</label>)}</fieldset>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={event => change('active', event.target.checked)} />حساب فعال</label>
          </>}
          <button className={buttonClass} type="submit">{saving ? 'در حال ذخیره…' : editing ? 'ذخیره تغییرات' : 'ایجاد'}</button>
        </fieldset>
        {editing && <button type="button" disabled={saving} onClick={reset} className="mt-4 text-sm font-semibold text-cyan-700">لغو ویرایش</button>}
      </form>
      <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">{kind === 'support' ? 'کاربران پشتیبان' : kind === 'categories' ? 'دسته‌بندی‌ها' : 'محصولات'} ({rows.length})</h2><button disabled={loading || saving || !canList} onClick={() => setRevision(value => value + 1)} className="text-sm font-semibold text-cyan-700 disabled:opacity-40">به‌روزرسانی</button></div>
        {loading ? <p role="status">در حال بارگذاری…</p> : canList && rows.length === 0 ? <p className="text-slate-500">رکوردی پیدا نشد.</p> : null}
        <ul className="divide-y divide-slate-100">{rows.map(row => <li key={entityId(row)} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold">{row.name || row.phone}</p><p className="text-sm text-slate-500">{kind === 'products' ? `${row.total_count ?? row.stock ?? 0} عدد موجود` : kind === 'categories' ? row.slug : `${row.phone || ''} · ${row.active === false ? 'غیرفعال' : 'فعال'}`}</p></div><div className="flex gap-3 text-sm">
          {kind === 'products' && <Link className="text-cyan-700" to={`/products/${encodeURIComponent(entityId(row))}`}>مشاهده</Link>}
          {allowManage && <><button disabled={!canUpdate || saving || loading || (kind === 'categories' && !row.slug)} onClick={() => startEdit(row)} className="text-cyan-700 disabled:opacity-40">ویرایش</button><button disabled={!canDelete || saving || loading || (kind === 'categories' && !row.slug)} onClick={() => setDeleting(row)} className="text-rose-700 disabled:opacity-40">حذف</button></>}
        </div></li>)}</ul>
        {deleting && <div role="alertdialog" aria-label="تأیید حذف" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4"><p>آیا {deleting.name || deleting.phone} حذف شود؟ این عملیات قابل بازگشت نیست.</p><div className="mt-3 flex gap-4"><button disabled={saving} onClick={remove} className={buttonClass}>تأیید حذف</button><button disabled={saving} onClick={() => setDeleting(null)}>انصراف</button></div></div>}
      </div>
    </div>
  </div>
}
