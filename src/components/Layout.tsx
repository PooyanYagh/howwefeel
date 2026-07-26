import { NavLink, Outlet } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { BarChart3, BookHeart, CalendarCheck2, HeartPulse, Home, ListTodo, LogOut, MoonStar, Sparkles, WandSparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'

const items = [
  ['/', Home, 'خانه'],
  ['/mood', HeartPulse, 'احساس‌ها'],
  ['/habits', CalendarCheck2, 'عادت‌ها'],
  ['/tasks', ListTodo, 'برنامه‌ها'],
  ['/journal', BookHeart, 'دفتر من'],
  ['/wishes', WandSparkles, 'آرزوها'],
  ['/dreams', MoonStar, 'رویاها'],
  ['/prayers', Sparkles, 'مناجات'],
  ['/reports', BarChart3, 'گزارش‌ها'],
] as const

export default function Layout({ user }: { user: User }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">✦</div>
        <nav>
          {items.map(([to, Icon, label]) => (
            <NavLink key={to} to={to} end={to === '/'} title={label} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="nav-item logout" onClick={() => supabase.auth.signOut()} title="خروج">
          <LogOut size={20}/><span>خروج</span>
        </button>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <h1>فضای شخصی من</h1>
            <p>{user.email}</p>
          </div>
          <div className="avatar">{(user.email?.[0] ?? 'پ').toUpperCase()}</div>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
