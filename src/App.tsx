import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Mood from './pages/Mood'
import Habits from './pages/Habits'
import Tasks from './pages/Tasks'
import Journal from './pages/Journal'
import Wishes from './pages/Wishes'
import Dreams from './pages/Dreams'
import Prayers from './pages/Prayers'
import Reports from './pages/Reports'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  if (loading) return <div className="center-screen">در حال بارگذاری…</div>
  if (!session) return <Login />

  return (
    <Routes>
      <Route element={<Layout user={session.user} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mood" element={<Mood />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/wishes" element={<Wishes />} />
        <Route path="/dreams" element={<Dreams />} />
        <Route path="/prayers" element={<Prayers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
