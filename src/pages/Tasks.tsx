import { FormEvent, useEffect, useState } from 'react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import type { Task } from '../lib/types'
export default function Tasks(){
 const [items,setItems]=useState<Task[]>([]),[title,setTitle]=useState(''),[due,setDue]=useState(''),[next,setNext]=useState('')
 useEffect(()=>{load()},[]);async function load(){const {data}=await supabase.from('tasks').select('*').order('due_at',{ascending:true});setItems(data??[])}
 async function add(e:FormEvent){e.preventDefault();const {data:{user}}=await supabase.auth.getUser();if(!user)return;await supabase.from('tasks').insert({user_id:user.id,title,due_at:due||null,next_action:next,status:'planned',priority:'medium'});setTitle('');setDue('');setNext('');load()}
 async function done(id:string){await supabase.from('tasks').update({status:'completed',completed_at:new Date().toISOString()}).eq('id',id);load()}
 return <div className="page"><div className="page-title"><div><h2>برنامه‌ها</h2><p>هر برنامه یک قدم بعدی روشن داشته باشد.</p></div></div><div className="two-col">
 <Card title="برنامه جدید"><form onSubmit={add} className="stack"><label>عنوان<input value={title} onChange={e=>setTitle(e.target.value)} required/></label><label>زمان<input type="datetime-local" value={due} onChange={e=>setDue(e.target.value)}/></label><label>قدم بعدی<input value={next} onChange={e=>setNext(e.target.value)} placeholder="اولین اقدام مشخص"/></label><button className="primary">ثبت برنامه</button></form></Card>
 <Card title="فهرست برنامه‌ها"><div className="task-list">{items.map(t=><div className={`task-row ${t.status==='completed'?'done':''}`} key={t.id}><span className={`priority ${t.priority}`}/><div><b>{t.title}</b><small>{t.next_action}{t.due_at&&` — ${new Date(t.due_at).toLocaleString('fa-IR')}`}</small></div>{t.status!=='completed'&&<button className="icon-button" onClick={()=>done(t.id)}>✓</button>}</div>)}</div></Card></div></div>
}
