import { ArrowLeft, Check, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { authApi, getApiMessage } from '../lib/api'
import { getPostLoginPath } from '../lib/catalog'

export function AuthPage() {
  const { user, saveSession } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const normalized = phone.replace(/[\\s-]/g, '')
    if (normalized !== phone) setPhone(normalized)
  }, [phone])
  if (user) return <Navigate to={getPostLoginPath(user)} replace />

  const submitPhone = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const normalizedPhone = phone.replace(/[\\s-]/g, '')
      const response = await authApi.requestOtp({ phone: normalizedPhone })
      console.log(response)
      setStep('otp')
    } catch (err) {
      setError(getApiMessage(err))
    } finally { setLoading(false) }
  }

  const submitOtp = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const normalizedPhone = phone.replace(/[\\s-]/g, '')
      const { data } = await authApi.verifyOtp({ phone: normalizedPhone, code : otp })
      const loggedInUser = await saveSession(data, { phone })
      navigate(getPostLoginPath(loggedInUser))
    } catch (err) {
      setError(getApiMessage(err))
    } finally { setLoading(false) }
  }

  return <section className="mx-auto grid min-h-[70vh] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-2">
    <div className="hidden rounded-[2rem] bg-ink p-8 text-white md:block">
      <img src="/captain-dev-wheel.png" className="mx-auto h-64 w-64 animate-float rounded-3xl object-cover" alt="کاپیتان دِو شاپ" />
      <p className="mt-7 text-sm font-medium text-cyan-200">کاپیتان دِو شاپ</p>
      <h1 className="mt-2 text-4xl font-bold leading-tight">خرید ساده، با شماره موبایل.</h1>
      <p className="mt-4 leading-8 text-slate-300">بدون رمز عبور؛ فقط شماره موبایل و یک کد تأیید امن.</p>
      <div className="mt-8 space-y-3 text-sm text-slate-300"><p className="flex items-center gap-2"><Check size={16} className="text-cyan-300" /> ورود و ثبت‌نام در یک مسیر</p><p className="flex items-center gap-2"><Check size={16} className="text-cyan-300" /> تازه‌سازی خودکار نشست</p></div>
    </div>
    <div className="mx-auto w-full max-w-md">
      <p className="text-sm font-semibold text-cyan-700">ورود / ثبت‌نام</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{step === 'phone' ? 'شماره موبایل خود را وارد کنید.' : 'کد تأیید را وارد کنید.'}</h1>
      <p className="mt-2 text-slate-500">{step === 'phone' ? 'برای ورود یا ساخت حساب جدید، شماره موبایل شما کافی است.' : `کد ارسال‌شده به ${phone} را وارد کنید.`}</p>
      {step === 'phone' ? <form onSubmit={submitPhone} className="mt-7 space-y-4">
        <label className="block text-sm font-medium">شماره موبایل<input required dir="ltr" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\\D/g, ''))} placeholder="09123456789" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" /></label>
        {error && <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-70">{loading ? <LoaderCircle className="animate-spin" size={18} /> : <>دریافت کد تأیید <ArrowLeft size={17} /></>}</button>
      </form> : <form onSubmit={submitOtp} className="mt-7 space-y-4">
        <label className="block text-sm font-medium">کد تأیید<input required dir="ltr" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="— — — — — —" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-4 text-center text-2xl tracking-[0.5em] outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" /></label>
        {error && <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-70">{loading ? <LoaderCircle className="animate-spin" size={18} /> : <>تأیید و ورود <ArrowLeft size={17} /></>}</button>
        <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError('') }} className="w-full text-sm font-semibold text-cyan-700">ویرایش شماره موبایل</button>
      </form>}
      <p className="mt-6 text-center text-sm text-slate-500">با ادامه، قوانین و حریم خصوصی کاپیتان دِو شاپ را می‌پذیرید.</p>
    </div>
  </section>
}
