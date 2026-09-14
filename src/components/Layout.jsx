import { LogIn, Menu, ShoppingBag, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

import { hasRole } from '../lib/catalog'

const navItems = [
  ['فروشگاه', '/products'],
  ['دسته‌بندی‌ها', '/categories'],
  ['سبد خرید', '/basket'],
  ['حساب کاربری', '/profile'],
]

export function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const { basketCount, user } = useApp()

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-ink shadow-lg shadow-slate-400/20">
              <img src="/captain-dev-wheel.png" width="48" height="48" decoding="async" className="h-12 w-12 object-cover" alt="" />
            </div>
            <span className="font-semibold tracking-tight">کاپیتان <em className="not-italic text-cyan-600">دِو شاپ</em></span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.slice(0, 2).map(([label, path]) => <NavItem key={path} label={label} path={path} />)}
            {hasRole(user, ['ADMIN', 'SUPERADMIN']) && <NavItem label="مدیریت" path="/admin" />}
            {hasRole(user, ['SUPPORT']) && <NavItem label="پشتیبانی" path="/support" />}
          </nav>
          <div className="flex items-center gap-2">
            {user && <Link to="/basket" className="relative grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-700 transition hover:-translate-y-0.5 hover:shadow-md">
              <ShoppingBag size={19} />
              {basketCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cyan-500 px-1 text-[11px] font-bold text-ink">{basketCount}</span>}
            </Link>}
            {user ? <Link to="/profile" className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-cyan-100 md:inline-flex"><UserRound size={16} /> حساب کاربری</Link>
              : <Link to="/auth" className="hidden items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 md:inline-flex"><LogIn size={16} /> ورود / ثبت‌نام</Link>}
            <button className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
        {open && <nav className="mx-4 mb-4 grid rounded-2xl bg-white p-2 shadow-glow md:hidden">
          {navItems.filter(([, path]) => path !== '/basket' || user).map(([label, path]) => <NavItem key={path} label={label} path={path} onClick={() => setOpen(false)} />)}
          {hasRole(user, ['ADMIN', 'SUPERADMIN']) && <NavItem label="مدیریت" path="/admin" onClick={() => setOpen(false)} />}
          {hasRole(user, ['SUPPORT']) && <NavItem label="پشتیبانی" path="/support" onClick={() => setOpen(false)} />}
          {!user && <Link to="/auth" onClick={() => setOpen(false)} className="mt-1 rounded-lg bg-ink px-3 py-2 text-center text-sm font-semibold text-white">ورود / ثبت‌نام</Link>}
        </nav>}
      </header>
      <main>{children}</main>
      <footer className="mt-16 bg-ink px-4 py-10 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="font-medium text-white">کاپیتان دِو شاپ</p>
          <p className="text-sm">لباس‌های ساده برای هر روز شما.</p>
        </div>
      </footer>
    </div>
  )
}

function NavItem({ label, path, onClick }) {
  return <NavLink to={path} onClick={onClick} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-cyan-100 text-cyan-800' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'}`}>{label}</NavLink>
}
