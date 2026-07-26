import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import type { Emotion } from '../lib/types'

type Selected = { emotion: Emotion, intensity: number }

export default function Mood() {
  const [emotions,setEmotions]=useState<Emotion[]>([])
  const [selected,setSelected]=useState<Selected[]>([])
  const [query,setQuery]=useState('')
  const [note,setNote]=useState('')
  const [saved,setSaved]=useState(false)

  useEffect(()=>{supabase.from('emotions').select('*').eq('is_active',true).order('sort_order').then(({data})=>setEmotions(data??[]))},[])
  const filtered=useMemo(()=>emotions.filter(x=>x.name_fa.includes(query)),[emotions,query])
  function toggle(e:Emotion){setSelected(s=>s.some(x=>x.emotion.id===e.id)?s.filter(x=>x.emotion.id!==e.id):[...s,{emotion:e,intensity:7}])}
  function intensity(id:number,value:number){setSelected(s=>s.map(x=>x.emotion.id===id?{...x,intensity:value}:x))}
  async function save(){
    if(!selected.length)return
    const {data:{user}}=await supabase.auth.getUser()
    if(!user)return
    const weighted=selected.reduce((a,x)=>a+x.emotion.valence*x.intensity,0)/selected.reduce((a,x)=>a+x.intensity,0)
    const arousal=selected.reduce((a,x)=>a+x.emotion.arousal*x.intensity,0)/selected.reduce((a,x)=>a+x.intensity,0)
    const score=Math.max(-100,Math.min(100,weighted*20))
    const {data:entry,error}=await supabase.from('mood_entries').insert({user_id:user.id,note,mood_score:score,overall_valence:weighted,overall_arousal:arousal}).select().single()
    if(error||!entry){alert(error?.message);return}
    await supabase.from('mood_entry_emotions').insert(selected.map(x=>({mood_entry_id:entry.id,emotion_id:x.emotion.id,intensity:x.intensity})))
    setSaved(true);setSelected([]);setNote('');setTimeout(()=>setSaved(false),2500)
  }
  return <div className="page">
    <div className="page-title"><div><h2>ثبت احساس</h2><p>می‌توانی چند احساس هم‌زمان انتخاب کنی و شدت هرکدام را مشخص کنی.</p></div></div>
    <div className="two-col">
      <Card title="چه احساسی داری؟">
        <input className="search" placeholder="جست‌وجوی احساس…" value={query} onChange={e=>setQuery(e.target.value)}/>
        <div className="emotion-grid">
          {filtered.map(e=><button key={e.id} className={selected.some(x=>x.emotion.id===e.id)?'emotion-chip selected':'emotion-chip'} onClick={()=>toggle(e)}>
            <span>{e.icon||'●'}</span>{e.name_fa}
          </button>)}
        </div>
      </Card>
      <Card title="احساس‌های انتخاب‌شده">
        {!selected.length?<div className="empty">حداقل یک احساس انتخاب کن.</div>:selected.map(x=><div className="selected-emotion" key={x.emotion.id}>
          <div><b>{x.emotion.name_fa}</b><span>{x.intensity}/۱۰</span></div>
          <input type="range" min="1" max="10" value={x.intensity} onChange={e=>intensity(x.emotion.id,+e.target.value)}/>
        </div>)}
        <textarea rows={6} placeholder="چه اتفاقی افتاد؟ هرچقدر دوست داری بنویس…" value={note} onChange={e=>setNote(e.target.value)}/>
        <button className="primary" disabled={!selected.length} onClick={save}>ثبت این لحظه</button>
        {saved&&<div className="success">با موفقیت ثبت شد ✓</div>}
      </Card>
    </div>
  </div>
}
