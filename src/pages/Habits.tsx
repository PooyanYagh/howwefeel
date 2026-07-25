import { FormEvent, useEffect, useState } from 'react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import type { Habit } from '../lib/types'

export default function Habits(){
 const [items,setItems]=useState<Habit[]>([]);const [title,setTitle]=useState('');const [frequency,setFrequency]=useState('daily')
 useEffect(()=>{load()},[])
 async function load(){const {data}=await supabase.from('habits').select('*').order('created_at');setItems(data??[])}
 async function add(e:FormEvent){e.preventDefault();const {data:{user}}=await supabase.auth.getUser();if(!user)return
 await supabase.from('habits').insert({user_id:user.id,title,frequency_type:frequency,target_count:1,is_active:true});setTitle('');load()}
 async function log(h:Habit,status:string){const {data:{user}}=await supabase.auth.getUser();if(!user)return
 await supabase.from('habit_logs').upsert({user_id:user.id,habit_id:h.id,log_date:new Date().toISOString().slice(0,10),status},{onConflict:'habit_id,log_date'});load()}
 async function archive(id:string){await supabase.from('habits').update({is_active:false,archived_at:new Date().toISOString()}).eq('id',id);load()}
 return <div className="page"><div className="page-title"><div><h2>عادت‌های من</h2><p>روزانه، هفتگی یا چندبار در هفته؛ بدون فشار و قضاوت.</p></div></div>
 <div className="two-col"><Card title="عادت جدید"><form onSubmit={add} className="stack">
 <label>عنوان<input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="مثلاً ۲۰ دقیقه مدیتیشن"/></label>
 <label>نوع تکرار<select value={frequency} onChange={e=>setFrequency(e.target.value)}><option value="daily">روزانه</option><option value="specific_days">روزهای مشخص</option><option value="times_per_week">چندبار در هفته</option><option value="numeric">عددی</option><option value="duration">مدت‌دار</option></select></label>
 <button className="primary">افزودن عادت</button></form></Card>
 <Card title="فهرست فعال"><div className="habit-list">{items.filter(x=>x.is_active).map(h=><div className="habit-item" key={h.id}><div><b>{h.title}</b><small>{h.frequency_type}</small></div><div className="habit-actions"><button onClick={()=>log(h,'completed')}>✓</button><button onClick={()=>log(h,'partial')}>نیمه</button><button onClick={()=>archive(h.id)}>بایگانی</button></div></div>)}{!items.filter(x=>x.is_active).length&&<div className="empty">هنوز عادتی ثبت نشده.</div>}</div></Card></div></div>
}
