import { FormEvent, useEffect, useState } from 'react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import type { Wish } from '../lib/types'
export default function Wishes(){
 const [items,setItems]=useState<Wish[]>([]),[form,setForm]=useState({title:'',description:'',why_it_matters:'',desired_feeling:'',first_step:''})
 useEffect(()=>{load()},[]);async function load(){const {data}=await supabase.from('wishes').select('*').order('created_at',{ascending:false});setItems(data??[])}
 async function add(e:FormEvent){e.preventDefault();const {data:{user}}=await supabase.auth.getUser();if(!user)return;await supabase.from('wishes').insert({...form,user_id:user.id,status:'active',progress:0});setForm({title:'',description:'',why_it_matters:'',desired_feeling:'',first_step:''});load()}
 return <div className="page"><div className="page-title"><div><h2>آرزوهای من</h2><p>فقط مقصد را ننویس؛ حسی را که از آن زندگی می‌خواهی هم ثبت کن.</p></div></div><div className="two-col">
 <Card title="آرزوی جدید"><form onSubmit={add} className="stack">{(['title','description','why_it_matters','desired_feeling','first_step'] as const).map(k=><label key={k}>{({title:'عنوان',description:'تصویر آرزو',why_it_matters:'چرا برایم مهم است؟',desired_feeling:'می‌خواهم چه حسی را تجربه کنم؟',first_step:'اولین قدم کوچک'})[k]}{k==='description'||k==='why_it_matters'?<textarea value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>:<input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required={k==='title'}/>}</label>)}<button className="primary">ثبت آرزو</button></form></Card>
 <div className="wish-grid">{items.map(w=><Card key={w.id} title={w.title} className="wish-card"><p>{w.why_it_matters||w.description}</p><small>احساس مطلوب: {w.desired_feeling||'—'}</small><div className="progress"><i style={{width:`${w.progress}%`}}/></div><b>قدم اول: {w.first_step||'هنوز مشخص نشده'}</b></Card>)}</div></div></div>
}
