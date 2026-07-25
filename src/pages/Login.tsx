import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login'|'signup'>('login')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('')
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
    setBusy(false)
    setMessage(result.error ? result.error.message : mode === 'signup' ? 'حساب ساخته شد؛ ایمیل تأیید را بررسی کن.' : '')
  }

  return <div className="auth-page">
    <div className="auth-card">
      <div className="auth-logo">✦</div>
      <h1>DailyMood</h1>
      <p>دفتر شخصی احساس، برنامه، عادت و رویا</p>
      <form onSubmit={submit}>
        <label>ایمیل<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
        <label>رمز عبور<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required/></label>
        <button className="primary" disabled={busy}>{busy ? 'لطفاً صبر کن…' : mode === 'login' ? 'ورود' : 'ساخت حساب'}</button>
      </form>
      {message && <div className="notice">{message}</div>}
      <button className="link-btn" onClick={()=>setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? 'اولین بار است؟ ساخت حساب' : 'حساب دارم؛ ورود'}
      </button>
    </div>
  </div>
}
