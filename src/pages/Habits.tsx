import { FormEvent, useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import type { Habit, HabitLog, HabitStatus } from '../lib/types'

const weekDays = [
  { value: 6, label: 'شنبه' },
  { value: 0, label: 'یکشنبه' },
  { value: 1, label: 'دوشنبه' },
  { value: 2, label: 'سه‌شنبه' },
  { value: 3, label: 'چهارشنبه' },
  { value: 4, label: 'پنجشنبه' },
  { value: 5, label: 'جمعه' },
]

function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateMinusDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return localDateKey(date)
}

export default function Habits() {
  const [items, setItems] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('✨')
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])
  const [loading, setLoading] = useState(true)
  const today = localDateKey()

  useEffect(() => { void load() }, [])

  async function load() {
    setLoading(true)
    const startDate = dateMinusDays(365)
    const [habitsResult, logsResult] = await Promise.all([
      supabase.from('habits').select('*').eq('is_active', true).order('created_at'),
      supabase.from('habit_logs').select('*').gte('log_date', startDate).order('log_date'),
    ])

    if (habitsResult.error) alert(habitsResult.error.message)
    if (logsResult.error) alert(logsResult.error.message)
    setItems(habitsResult.data ?? [])
    setLogs(logsResult.data ?? [])
    setLoading(false)
  }

  async function add(e: FormEvent) {
    e.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle || !targetDays.length) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('habits').insert({
      user_id: user.id,
      title: cleanTitle,
      icon: icon.trim() || '✨',
      target_days: targetDays,
      is_active: true,
    })

    if (error) {
      alert(error.message)
      return
    }

    setTitle('')
    setIcon('✨')
    setTargetDays([0, 1, 2, 3, 4, 5, 6])
    await load()
  }

  async function setStatus(habit: Habit, status: HabitStatus | null) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (status === null) {
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habit.id)
        .eq('log_date', today)
      if (error) alert(error.message)
    } else {
      const { error } = await supabase.from('habit_logs').upsert({
        user_id: user.id,
        habit_id: habit.id,
        log_date: today,
        status,
      }, { onConflict: 'habit_id,log_date' })
      if (error) alert(error.message)
    }

    await load()
  }

  async function archive(id: string) {
    const { error } = await supabase.from('habits').update({ is_active: false }).eq('id', id)
    if (error) alert(error.message)
    await load()
  }

  function toggleDay(day: number) {
    setTargetDays(days => days.includes(day) ? days.filter(x => x !== day) : [...days, day].sort())
  }

  const logMap = useMemo(() => new Map(logs.map(log => [`${log.habit_id}:${log.log_date}`, log])), [logs])

  function getStats(habit: Habit) {
    const habitLogs = logs.filter(log => log.habit_id === habit.id)
    const done = habitLogs.filter(log => log.status === 'done').length
    const missed = habitLogs.filter(log => log.status === 'missed').length
    const skipped = habitLogs.filter(log => log.status === 'skipped').length
    const considered = done + missed
    const rate = considered ? Math.round((done / considered) * 100) : 0

    let currentStreak = 0
    for (let index = 0; index < 365; index += 1) {
      const date = new Date()
      date.setDate(date.getDate() - index)
      if (!habit.target_days.includes(date.getDay())) continue
      const status = logMap.get(`${habit.id}:${localDateKey(date)}`)?.status
      if (status === 'done') currentStreak += 1
      else if (status === 'skipped') continue
      else break
    }

    return { done, missed, skipped, rate, currentStreak }
  }

  return <div className="page">
    <div className="page-title"><div><h2>عادت‌های من</h2><p>هر روز ثبت کن چه چیزی انجام شد، انجام نشد یا عمداً رد شد.</p></div></div>

    <div className="two-col habits-layout">
      <Card title="عادت جدید">
        <form onSubmit={add} className="stack">
          <label>عنوان<input value={title} onChange={e => setTitle(e.target.value)} required placeholder="مثلاً ۲۰ دقیقه مدیتیشن" /></label>
          <label>آیکون<input value={icon} onChange={e => setIcon(e.target.value)} maxLength={4} placeholder="✨" /></label>
          <div>
            <span className="field-label">روزهای هدف</span>
            <div className="weekday-picker">
              {weekDays.map(day => <button
                type="button"
                key={day.value}
                className={targetDays.includes(day.value) ? 'selected' : ''}
                onClick={() => toggleDay(day.value)}
              >{day.label}</button>)}
            </div>
          </div>
          <button className="primary" disabled={!title.trim() || !targetDays.length}>افزودن عادت</button>
        </form>
      </Card>

      <Card title="ثبت امروز" subtitle={new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full' }).format(new Date())}>
        {loading ? <div className="empty">در حال بارگذاری…</div> : <div className="habit-list">
          {items.map(habit => {
            const todayLog = logMap.get(`${habit.id}:${today}`)
            const stats = getStats(habit)
            return <article className="habit-card" key={habit.id}>
              <div className="habit-card-head">
                <div className="habit-title"><span>{habit.icon || '✨'}</span><div><b>{habit.title}</b><small>{habit.target_days.length === 7 ? 'هر روز' : `${habit.target_days.length} روز در هفته`}</small></div></div>
                <button className="text-button" onClick={() => archive(habit.id)}>بایگانی</button>
              </div>

              <div className="habit-status-actions">
                <button className={todayLog?.status === 'done' ? 'done active' : 'done'} onClick={() => setStatus(habit, 'done')}>✓ انجام شد</button>
                <button className={todayLog?.status === 'missed' ? 'missed active' : 'missed'} onClick={() => setStatus(habit, 'missed')}>× انجام نشد</button>
                <button className={todayLog?.status === 'skipped' ? 'skipped active' : 'skipped'} onClick={() => setStatus(habit, 'skipped')}>— رد شد</button>
                {todayLog && <button className="clear-status" onClick={() => setStatus(habit, null)}>پاک‌کردن ثبت</button>}
              </div>

              <div className="habit-stats">
                <div><b>{stats.currentStreak}</b><span>زنجیره فعلی</span></div>
                <div><b>{stats.done}</b><span>انجام‌شده</span></div>
                <div><b>{stats.missed}</b><span>انجام‌نشده</span></div>
                <div><b>{stats.rate}%</b><span>نرخ موفقیت</span></div>
              </div>
            </article>
          })}
          {!items.length && <div className="empty">هنوز عادتی ثبت نشده.</div>}
        </div>}
      </Card>
    </div>
  </div>
}
