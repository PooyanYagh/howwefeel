import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowLeft, Check, ChevronDown, Search, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Emotion } from '../lib/types'

type Selected = { emotion: Emotion; intensity: number }
type Quadrant = 'red' | 'yellow' | 'green' | 'blue'
type Filter = 'all' | Quadrant

function getQuadrant(emotion: Emotion): Quadrant {
  const pleasant = emotion.valence >= 0
  const energized = emotion.arousal >= 3
  if (pleasant && energized) return 'yellow'
  if (pleasant && !energized) return 'green'
  if (!pleasant && energized) return 'red'
  return 'blue'
}

const filters: Array<{id: Filter; label: string}> = [
  {id:'all', label:'همه'}, {id:'red', label:'پرانرژی و دشوار'},
  {id:'yellow', label:'پرانرژی و خوشایند'}, {id:'blue', label:'کم‌انرژی و دشوار'},
  {id:'green', label:'آرام و خوشایند'},
]

export default function Mood() {
  const [emotions, setEmotions] = useState<Emotion[]>([])
  const [selected, setSelected] = useState<Selected[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { void loadEmotions() }, [])

  async function loadEmotions() {
    setLoading(true); setError(null)
    const { data, error: loadError } = await supabase
      .from('emotions')
      .select('id,name_fa,category,valence,arousal,icon')
      .eq('is_active', true)
      .order('sort_order')
    if (loadError) setError(loadError.message)
    setEmotions((data ?? []) as Emotion[])
    setLoading(false)
  }

  const visible = useMemo(() => emotions.filter(e => {
    const searchMatch = !query.trim() || e.name_fa.includes(query.trim())
    const filterMatch = filter === 'all' || getQuadrant(e) === filter
    return searchMatch && filterMatch
  }), [emotions, query, filter])

  const grouped = useMemo(() => {
    const order: Quadrant[] = ['red','yellow','blue','green']
    return order.flatMap(color => visible.filter(e => getQuadrant(e) === color))
  }, [visible])

  function toggle(emotion: Emotion) {
    setSelected(current => current.some(x => x.emotion.id === emotion.id)
      ? current.filter(x => x.emotion.id !== emotion.id)
      : [...current, {emotion, intensity: 7}])
  }

  function changeIntensity(id: number, intensity: number) {
    setSelected(current => current.map(x => x.emotion.id === id ? {...x, intensity} : x))
  }

  async function save() {
    if (!selected.length || saving) return
    setSaving(true); setError(null)
    const {data:{user}, error:userError} = await supabase.auth.getUser()
    if (userError || !user) { setError(userError?.message ?? 'نشست کاربری پیدا نشد.'); setSaving(false); return }
    const total = selected.reduce((sum,x) => sum + x.intensity, 0)
    const valence = selected.reduce((sum,x) => sum + x.emotion.valence*x.intensity, 0) / total
    const arousal = selected.reduce((sum,x) => sum + x.emotion.arousal*x.intensity, 0) / total
    const {data:entry, error:entryError} = await supabase.from('mood_entries').insert({
      user_id:user.id, note:note.trim() || null, mood_score:Math.max(-100,Math.min(100,valence*20)),
      overall_valence:valence, overall_arousal:arousal,
    }).select().single()
    if (entryError || !entry) { setError(entryError?.message ?? 'ثبت انجام نشد.'); setSaving(false); return }
    const {error:relationError} = await supabase.from('mood_entry_emotions').insert(selected.map(x => ({
      mood_entry_id:entry.id, emotion_id:x.emotion.id, intensity:x.intensity,
    })))
    if (relationError) { await supabase.from('mood_entries').delete().eq('id',entry.id); setError(relationError.message); setSaving(false); return }
    setSaving(false); setSaved(true); setSelected([]); setNote(''); setDetailsOpen(false)
    window.setTimeout(() => setSaved(false), 2600)
  }

  if (loading) return <div className="emotion-map-state"><div className="mood-loader"/><p>نقشه احساس‌ها در حال آماده‌شدن است…</p></div>
  if (error && !emotions.length) return <div className="emotion-map-state"><h2>احساس‌ها بارگذاری نشدند</h2><p>{error}</p><button onClick={() => void loadEmotions()}>تلاش دوباره</button></div>

  return (
    <div className="emotion-map-page" dir="rtl">
      <header className="emotion-map-header">
        <div>
          <span>CHECK‑IN روزانه</span>
          <h1>الان دقیقاً چه احساسی داری؟</h1>
          <p>یک یا چند واژه را انتخاب کن؛ داشتن چند حس هم‌زمان کاملاً طبیعی است.</p>
        </div>
        <div className="emotion-search-floating">
          <Search size={20}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="جست‌وجوی احساس…"/>
          {query && <button onClick={() => setQuery('')}><X size={18}/></button>}
        </div>
      </header>

      <div className="emotion-filter-row">
        {filters.map(item => <button key={item.id} className={filter===item.id ? `active ${item.id}` : ''} onClick={() => setFilter(item.id)}>{item.label}</button>)}
      </div>

      <main className="emotion-bubble-map" aria-label="نقشه احساسات">
        {grouped.map((emotion,index) => {
          const color = getQuadrant(emotion)
          const isSelected = selected.some(x => x.emotion.id === emotion.id)
          return (
            <button
              key={emotion.id}
              className={`map-bubble ${color} ${isSelected ? 'selected' : ''}`}
              style={{'--delay':`${Math.min(index,30)*18}ms`} as CSSProperties}
              onClick={() => toggle(emotion)}
              aria-pressed={isSelected}
            >
              {isSelected && <span className="map-bubble-check"><Check size={16}/></span>}
              <span className="map-bubble-icon">{emotion.icon}</span>
              <strong>{emotion.name_fa}</strong>
            </button>
          )
        })}
        {!grouped.length && <div className="emotion-no-result">احساسی با این عبارت پیدا نشد.</div>}
      </main>

      <div className={`emotion-selection-bar ${selected.length ? 'visible' : ''}`}>
        <div className="selection-summary">
          <div className="selection-avatars">
            {selected.slice(-4).map(x => <span key={x.emotion.id} className={getQuadrant(x.emotion)}>{x.emotion.icon}</span>)}
          </div>
          <div><b>{selected.at(-1)?.emotion.name_fa}</b><small>{selected.length > 1 ? `${selected.length} احساس انتخاب شده` : 'برای تعیین شدت ادامه بده'}</small></div>
        </div>
        <button className="selection-continue" onClick={() => setDetailsOpen(true)} aria-label="ادامه"><ArrowLeft size={27}/></button>
      </div>

      {detailsOpen && (
        <div className="emotion-sheet-backdrop" onClick={() => setDetailsOpen(false)}>
          <section className="emotion-details-sheet" onClick={e => e.stopPropagation()}>
            <button className="sheet-close" onClick={() => setDetailsOpen(false)}><ChevronDown size={24}/></button>
            <div className="sheet-handle"/>
            <div className="sheet-title"><span>مرحله دوم</span><h2>شدت احساس‌ها چقدر است؟</h2><p>شدت هر حس را جداگانه تنظیم کن.</p></div>
            <div className="sheet-selected-list">
              {selected.map(item => <div className="sheet-emotion-row" key={item.emotion.id}>
                <div className={`sheet-emotion-symbol ${getQuadrant(item.emotion)}`}>{item.emotion.icon}</div>
                <div className="sheet-emotion-control">
                  <div><b>{item.emotion.name_fa}</b><span>{item.intensity} از ۱۰</span></div>
                  <input type="range" min="1" max="10" value={item.intensity} onChange={e => changeIntensity(item.emotion.id,+e.target.value)}/>
                </div>
                <button onClick={() => toggle(item.emotion)}><X size={18}/></button>
              </div>)}
            </div>
            <label className="sheet-note"><span>چه اتفاقی افتاد؟ <small>اختیاری</small></span><textarea rows={4} value={note} onChange={e => setNote(e.target.value)} placeholder="هرچقدر دوست داری بنویس…"/></label>
            {error && <div className="mood-inline-error">{error}</div>}
            <button className="sheet-save" disabled={!selected.length || saving} onClick={() => void save()}>{saving ? 'در حال ثبت…' : 'ثبت این لحظه'}</button>
          </section>
        </div>
      )}

      {saved && <div className="emotion-toast">این لحظه با موفقیت ثبت شد ✓</div>}
    </div>
  )
}
