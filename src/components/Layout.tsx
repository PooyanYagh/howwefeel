import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import {
  BarChart3, BookHeart, CalendarCheck2, HeartPulse, Home, ListTodo,
  LogOut, Menu, MoonStar, Sparkles, WandSparkles, X,
} from 'lucide-react'
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

const primaryMobile = items.slice(0, 4)

export default function Layout({ user }: { user: User }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const immersive = location.pathname === '/mood'

  return (
    <div className={`app-shell ${immersive ? 'immersive-route' : ''}`}>
      <aside className="sidebar desktop-sidebar">
        <div className="brand">✦</div>
        <nav>
          {items.map(([to, Icon, label]) => (
            <NavLink key={to} to={to} end={to === '/'} title={label} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <Icon size={20} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="nav-item logout" onClick={() => supabase.auth.signOut()} title="خروج">
          <LogOut size={20}/><span>خروج</span>
        </button>
      </aside>

      <main className="main">
        {!immersive && (
          <header className="topbar">
            <div><h1>فضای شخصی من</h1><p>{user.email}</p></div>
            <div className="avatar">{(user.email?.[0] ?? 'پ').toUpperCase()}</div>
          </header>
        )}
        <Outlet />
      </main>

      <nav className="mobile-bottom-nav" aria-label="منوی اصلی">
        {primaryMobile.map(([to, Icon, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({isActive}) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'}>
            <Icon size={21}/><span>{label}</span>
          </NavLink>
        ))}
        <button className={`mobile-nav-item ${moreOpen ? 'active' : ''}`} onClick={() => setMoreOpen(v => !v)}>
          {moreOpen ? <X size={21}/> : <Menu size={21}/>}<span>بیشتر</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="mobile-more-sheet" onClick={() => setMoreOpen(false)}>
          <div className="mobile-more-panel" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="mobile-more-grid">
              {items.slice(4).map(([to, Icon, label]) => (
                <NavLink key={to} to={to} className="mobile-more-link" onClick={() => setMoreOpen(false)}>
                  <Icon size={24}/><span>{label}</span>
                </NavLink>
              ))}
              <button className="mobile-more-link danger" onClick={() => supabase.auth.signOut()}>
                <LogOut size={24}/><span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
