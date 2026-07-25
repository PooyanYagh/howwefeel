import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import type { MoodEntry } from '../lib/types'
export default function Reports(){
 const [items,setItems]=useState<MoodEntry[]>([])
 useEffect(()=>{const d=new Date();d.setDate(d.getDate()-30);supabase.from('mood_entries').select('*').gte('recorded_at',d.toISOString()).order('recorded_at').then(({data})=>setItems(data??[]))},[])
 const data=useMemo(()=>items.map(x=>({date:new Date(x.recorded_at).toLocaleDateString('fa-IR',{month:'short',day:'numeric'}),score:Math.round(x.mood_score),energy:+x.overall_arousal.toFixed(1)})),[items])
 const avg=data.length?Math.round(data.reduce((a,x)=>a+x.score,0)/data.length):0
 return <div className="page"><div className="page-title"><div><h2>گزارش‌ها</h2><p>الگوها را ببین، نه برای قضاوت؛ برای شناخت بیشتر خودت.</p></div></div><div className="stats-row"><Card><div className="metric"><b>{avg}</b><span>میانگین مود ۳۰ روز</span></div></Card><Card><div className="metric"><b>{data.length}</b><span>تعداد ثبت‌ها</span></div></Card></div><Card title="روند سی‌روزه"><ResponsiveContainer width="100%" height={360}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="date"/><YAxis domain={[-100,100]}/><Tooltip/><Bar dataKey="score" fill="#7568d5" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></Card></div>
}
