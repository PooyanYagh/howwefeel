import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import type { Habit, HabitLog, MoodEntry, PrayerLine, Task, Wish } from '../lib/types'

function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function Dashboard() {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [wish, setWish] = useState<Wish | null>(null)
  const [prayers, setPrayers] = useState<PrayerLine[]>([])

  useEffect(() => { void load() }, [])

  async function load() {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - 6)
    const today = localDateKey()

    const [m, h, hl, t, w, p] = await Promise.all([
      supabase.from('mood_entries').select('*').gte('recorded_at', start.toISOString()).order('recorded_at'),
      supabase.from('habits').select('*').eq('is_active', true).limit(6),
      supabase.from('habit_logs').select('*').eq('log_date', today),
      supabase.from('tasks').select('*').neq('status', 'completed').order('due_at', { ascending: true }).limit(5),
      supabase.from('wishes').select('*').eq('status', 'active').limit(10),
      supabase.rpc('get_daily_prayer_lines', { requested_count: 2 }),
    ])

    setMoods(m.data ?? [])
    setHabits(h.data ?? [])
    setHabitLogs(hl.data ?? [])
    setTasks(t.data ?? [])
    const ws = w.data ?? []
    setWish(ws.length ? ws[Math.floor(Math.random() * ws.length)] : null)
    setPrayers(p.data ?? [])
  }

  const dailyMoods = useMemo(() => {
    const grouped = new Map<string, number[]>()
    moods.forEach(entry => {
      const key = localDateKey(new Date(entry.recorded_at))
      const values = grouped.get(key) ?? []
      values.push(Number(entry.mood_score))
      grouped.set(key, values)
    })

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - (6 - index))
      const key = localDateKey(date)
      const values = grouped.get(key) ?? []
      const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
      return {
        date: key,
        day: new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date),
        score: average === null ? null : Math.round(average),
        count: values.length,
      }
    })
  }, [moods])

  const availableDailyMoods = dailyMoods.filter(day => day.score !== null)
  const todayMood = dailyMoods.at(-1)
  const previousMood = availableDailyMoods.filter(day => day.date !== todayMood?.date).at(-1)
  const todayScore = todayMood?.score ?? 0
  const previousScore = previousMood?.score ?? 0
  const todayLogMap = useMemo(() => new Map(habitLogs.map(log => [log.habit_id, log])), [habitLogs])
  const todayWeekday = new Date().getDay()
  const todayHabits = habits.filter(habit => habit.target_days.includes(todayWeekday))
  const completedHabits = todayHabits.filter(habit => todayLogMap.get(habit.id)?.status === 'done').length

  return <div className="page">
    <div className="welcome">
      <div><h2>سلام پویان 👋</h2><p>امروز با خودت مهربان باش؛ هر چیزی که هست، می‌تواند اینجا ثبت شود.</p></div>
      <a className="primary small" href="/mood">+ ثبت احساس</a>
    </div>

    <div className="dashboard-grid">
      <Card title="روند مود" subtitle="میانگین روزانه هفت روز اخیر" className="span-2">
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyMoods}>
              <defs><linearGradient id="fillMood" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#7766d7" stopOpacity=".5" /><stop offset="95%" stopColor="#7766d7" stopOpacity=".03" /></linearGradient></defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis domain={[-100, 100]} hide />
              <Tooltip formatter={(value, _name, item) => [`${value ?? '-'} (${item.payload.count} ثبت)`, 'میانگین مود']} />
              <Area connectNulls type="monotone" dataKey="score" stroke="#26232b" strokeWidth={3} fill="url(#fillMood)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="مود امروز" className="dark-card">
        <div className="big-number">{todayMood?.score === null ? '—' : todayScore}</div>
        <p>{todayMood?.count ? `${todayMood.count} ثبت امروز، با میانگین روزانه` : 'هنوز احساسی برای امروز ثبت نشده'}</p>
        {todayMood?.count ? <div className="delta">{todayScore - previousScore >= 0 ? '↗' : '↘'} {Math.abs(Math.round(todayScore - previousScore))} نسبت به آخرین روز ثبت‌شده</div> : null}
      </Card>

      <Card title="مناجات امروز" className="prayer-card span-2">
        {prayers.length ? prayers.map(x => <blockquote key={x.id}>«{x.text}»</blockquote>) : <p>پس از اجرای migration، جمله‌های مناجات اینجا نمایش داده می‌شوند.</p>}
      </Card>

      <Card title="عادت‌های امروز" subtitle={`${completedHabits} از ${todayHabits.length} انجام شده`}>
        <div className="mini-list habit-mini-list">
          {todayHabits.map(habit => {
            const status = todayLogMap.get(habit.id)?.status
            return <div key={habit.id}>
              <span className={`habit-state ${status ?? 'pending'}`}>{status === 'done' ? '✓' : status === 'missed' ? '×' : status === 'skipped' ? '—' : '○'}</span>
              <span>{habit.icon || '✨'} {habit.title}</span>
            </div>
          })}
          {!todayHabits.length && <p>برای امروز عادتی تعریف نشده.</p>}
        </div>
        {todayHabits.length > 0 && <a className="text-link" href="/habits">ثبت وضعیت عادت‌ها</a>}
      </Card>

      <Card title="برنامه‌های نزدیک" className="span-2">
        <div className="task-list">{tasks.map(t => <div key={t.id} className="task-row"><span className={`priority ${t.priority}`} /><div><b>{t.title}</b><small>{t.next_action || t.description}</small></div></div>)}{!tasks.length && <p>برنامه بازی وجود ندارد.</p>}</div>
      </Card>

      <Card title="آرزوی امروز" className="wish-card">
        {wish ? <><h2>{wish.title}</h2><p>{wish.why_it_matters || wish.description}</p><div className="progress"><i style={{ width: `${wish.progress}%` }} /></div><small>{wish.progress}% در مسیر</small></> : <p>اولین آرزویت را ثبت کن.</p>}
      </Card>
    </div>
  </div>
}
