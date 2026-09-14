import { LoaderCircle, LogOut, PackageCheck, Save, Shield, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getApiMessage, profileApi, unwrapApi } from '../lib/api'

const fields = [
  ['first_name', 'نام'], ['last_name', 'نام خانوادگی'], ['province', 'استان'],
  ['city', 'شهر'], ['address', 'آدرس'], ['postal_code', 'کد پستی'],
]

export function ProfilePage() {
  const { user, logout } = useApp()
  const [profile, setProfile] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    if (!user) return
    profileApi.get().then(({ data }) => {
      const value = unwrapApi(data)
      setProfile(value?.profile || value || {})
    }).catch((err) => {
      if (err.response?.status !== 404) setError(getApiMessage(err))
    }).finally(() => setLoading(false))
  }, [user])
  if (!user) return <Navigate to="/auth" replace />
  const name = user.name || user.firstName || user.email?.split('@')[0] || 'کاپیتان'
  return <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
    <div className="rounded-3xl bg-ink p-7 text-white sm:p-9"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-cyan-300 text-ink"><UserRound size={30} /></div><div className="flex-1"><p className="text-sm text-cyan-200">خوش آمدید</p><h1 className="text-3xl font-bold">{name}</h1><p className="mt-1 text-slate-300">{user.email || 'حساب کاربری شما متصل است.'}</p></div><button onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10"><LogOut size={16} /> خروج از حساب</button></div></div>
    <form onSubmit={async (event) => {
      event.preventDefault(); setSaving(true); setError(''); setMessage('')
      try { const keys = ['first_name', 'last_name', 'province', 'city', 'address', 'postal_code']; const payload = Object.fromEntries(keys.map(key => [key, profile[key] || ''])); const { data } = await profileApi.update(payload); setProfile(unwrapApi(data)?.profile || unwrapApi(data) || profile); setMessage('پروفایل شما با موفقیت ذخیره شد.') } catch (err) { setError(getApiMessage(err)) } finally { setSaving(false) }
    }} className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-5"><h2 className="text-xl font-bold">اطلاعات پروفایل</h2><p className="mt-1 text-sm text-slate-500">اطلاعات خود را تکمیل یا ویرایش کنید.</p></div>
      {loading ? <p role="status" className="flex items-center gap-2 py-8 text-slate-500"><LoaderCircle className="animate-spin" size={18} /> در حال دریافت اطلاعات پروفایل…</p> : <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([key, label]) => <label key={key} className={`block text-sm font-medium ${key === 'address' ? 'sm:col-span-2' : ''}`}>{label}<input value={profile[key] || ''} onChange={(event) => setProfile({ ...profile, [key]: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" /></label>)}
      </div>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {message && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <button disabled={loading || saving} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 font-semibold text-white disabled:opacity-60"><Save size={17} /> {saving ? 'در حال ذخیره…' : 'ذخیره پروفایل'}</button>
    </form>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <AccountTile icon={<PackageCheck />} title="سفارش‌ها" text="بعد از اتصال API، تاریخچه سفارش‌های شما اینجا نمایش داده می‌شود." action="مشاهده سفارش‌ها" />
      <AccountTile icon={<Shield />} title="امنیت حساب" text="توکن دسترسی شما در پس‌زمینه به‌صورت خودکار تازه می‌شود." action="تنظیمات حساب" />
    </div>
    <Link to="/products" className="mt-6 inline-block font-semibold text-cyan-700 hover:text-cyan-900">ادامه خرید ←</Link>
  </section>
}

function AccountTile({ icon, title, text, action }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-cyan-600">{icon}</div><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{text}</p><button className="mt-4 text-sm font-semibold text-cyan-700">{action} ←</button></div>
}
