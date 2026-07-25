import { FormEvent, useEffect, useState } from 'react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
type Entry={id:string,title:string|null,content:string,entry_type:string,created_at:string,is_favorite:boolean}
export default function Journal(){
 const [items,setItems]=useState<Entry[]>([]),[title,setTitle]=useState(''),[content,setContent]=useState(''),[type,setType]=useState('daily')
 useEffect(()=>{load()},[]);async function load(){const {data}=await supabase.from('journal_entries').select('*').is('deleted_at',null).order('created_at',{ascending:false});setItems(data??[])}
 async function add(e:FormEvent){e.preventDefault();const {data:{user}}=await supabase.auth.getUser();if(!user)return;await supabase.from('journal_entries').insert({user_id:user.id,title:title||null,content,entry_type:type});setTitle('');setContent('');load()}
 return <div className="page"><div className="page-title"><div><h2>دفتر من</h2><p>اینجا لازم نیست چیزی را مرتب یا قشنگ بنویسی؛ فقط واقعی باش.</p></div></div><div className="two-col wide-left">
 <Card title="نوشتن"><form onSubmit={add} className="stack"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="عنوان اختیاری"/><select value={type} onChange={e=>setType(e.target.value)}><option value="daily">یادداشت روزانه</option><option value="thought">فکر</option><option value="memory">خاطره</option><option value="gratitude">شکرگزاری</option><option value="letter">نامه</option><option value="idea">ایده</option></select><textarea className="editor" value={content} onChange={e=>setContent(e.target.value)} required placeholder="هرچه در ذهن و دلت هست بنویس…"/><button className="primary">ذخیره نوشته</button></form></Card>
 <Card title="نوشته‌های اخیر"><div className="entry-list">{items.map(x=><article key={x.id}><small>{new Date(x.created_at).toLocaleDateString('fa-IR')} · {x.entry_type}</small><h3>{x.title||'بدون عنوان'}</h3><p>{x.content.slice(0,220)}{x.content.length>220?'…':''}</p></article>)}{!items.length&&<div className="empty">اولین نوشته‌ات منتظر توست.</div>}</div></Card></div></div>
}
