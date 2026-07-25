import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import type { Habit, MoodEntry, PrayerLine, Task, Wish } from '../lib/types'

export default function Dashboard() {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [wish, setWish] = useState<Wish | null>(null)
  const [prayers, setPrayers] = useState<PrayerLine[]>([])

  useEffect(() => { load() }, [])
  async function load() {
    const start = new Date(); start.setDate(start.getDate()-7)
    const [m, h, t, w, p] = await Promise.all([
      supabase.from('mood_entries').select('*').gte('recorded_at', start.toISOString()).order('recorded_at'),
      supabase.from('habits').select('*').eq('is_active', true).limit(6),
      supabase.from('tasks').select('*').neq('status','completed').order('due_at',{ascending:true}).limit(5),
      supabase.from('wishes').select('*').eq('status','active').limit(10),
      supabase.rpc('get_daily_prayer_lines', { requested_count: 2 })
    ])
    setMoods(m.data ?? []); setHabits(h.data ?? []); setTasks(t.data ?? [])
    const ws = w.data ?? []; setWish(ws.length ? ws[Math.floor(Math.random()*ws.length)] : null)
    setPrayers(p.data ?? [])
  }

  const chart = useMemo(() => moods.map(x => ({
    day: new Intl.DateTimeFormat('fa-IR',{weekday:'short'}).format(new Date(x.recorded_at)),
    score: Math.round(x.mood_score)
  })), [moods])
  const today = moods.at(-1)?.mood_score ?? 0
  const yesterday = moods.at(-2)?.mood_score ?? 0

  return <div className="page">
    <div className="welcome">
      <div><h2>سلام پویان 👋</h2><p>امروز با خودت مهربان باش؛ هر چیزی که هست، می‌تواند اینجا ثبت شود.</p></div>
      <a className="primary small" href="/mood">+ ثبت احساس</a>
    </div>

    <div className="dashboard-grid">
      <Card title="روند مود" subtitle="هفت روز اخیر" className="span-2">
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chart}>
              <defs><linearGradient id="fillMood" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#7766d7" stopOpacity=".5"/><stop offset="95%" stopColor="#7766d7" stopOpacity=".03"/></linearGradient></defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false}/><YAxis domain={[-100,100]} hide/>
              <Tooltip/><Area type="monotone" dataKey="score" stroke="#26232b" strokeWidth={3} fill="url(#fillMood)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="مود امروز" className="dark-card">
        <div className="big-number">{Math.round(today)}</div>
        <p>{today >= 40 ? 'امروز روشن و مثبت بوده' : today <= -40 ? 'امروز کمی سخت گذشته' : 'امروز ترکیبی و متعادل بوده'}</p>
        <div className="delta">{today-yesterday >= 0 ? '↗' : '↘'} {Math.abs(Math.round(today-yesterday))} نسبت به ثبت قبل</div>
      </Card>

      <Card title="مناجات امروز" className="prayer-card span-2">
        {prayers.length ? prayers.map(x=><blockquote key={x.id}>«{x.text}»</blockquote>) : <p>پس از اجرای migration، جمله‌های مناجات اینجا نمایش داده می‌شوند.</p>}
      </Card>
      <Card title="عادت‌های فعال">
        <div className="mini-list">{habits.map(h=><div key={h.id}><span className="dot"/><span>{h.title}</span></div>)}{!habits.length && <p>هنوز عادتی تعریف نشده.</p>}</div>
      </Card>

      <Card title="برنامه‌های نزدیک" className="span-2">
        <div className="task-list">{tasks.map(t=><div key={t.id} className="task-row"><span className={`priority ${t.priority}`}/><div><b>{t.title}</b><small>{t.next_action || t.description}</small></div></div>)}{!tasks.length && <p>برنامه بازی وجود ندارد.</p>}</div>
      </Card>
      <Card title="آرزوی امروز" className="wish-card">
        {wish ? <><h2>{wish.title}</h2><p>{wish.why_it_matters || wish.description}</p><div className="progress"><i style={{width:`${wish.progress}%`}}/></div><small>{wish.progress}% در مسیر</small></> : <p>اولین آرزویت را ثبت کن.</p>}
      </Card>
    </div>
  </div>
}
