import { FormEvent, useEffect, useState } from 'react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
type Dream={id:string,title:string,summary:string|null,created_at:string}
export default function Dreams(){
 const [items,setItems]=useState<Dream[]>([]),[title,setTitle]=useState(''),[content,setContent]=useState('')
 useEffect(()=>{load()},[]);async function load(){const {data}=await supabase.from('dreams').select('*').order('created_at',{ascending:false});setItems(data??[])}
 async function add(e:FormEvent){e.preventDefault();const {data:{user}}=await supabase.auth.getUser();if(!user)return;const {data:d}=await supabase.from('dreams').insert({user_id:user.id,title,summary:content,status:'active'}).select().single();if(d)await supabase.from('dream_sections').insert({dream_id:d.id,title:'تصویر کلی',content,sort_order:1});setTitle('');setContent('');load()}
 return <div className="page"><div className="page-title"><div><h2>دفتر رویاها</h2><p>زندگی آینده‌ات را با جزئیات بنویس؛ خانه، رابطه، کار، سفر و احساسی که در آن جاری است.</p></div></div><div className="two-col wide-left"><Card title="رویای تازه"><form onSubmit={add} className="stack"><input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="نام این رویا"/><textarea className="dream-editor" value={content} onChange={e=>setContent(e.target.value)} required placeholder="صبح آن زندگی چطور بیدار می‌شوی؟ کجا هستی؟ چه کسانی کنارت هستند؟ چه چیزی دیگر نگرانت نمی‌کند؟"/><button className="primary">ذخیره رویا</button></form></Card><Card title="رویاهای من"><div className="entry-list">{items.map(d=><article key={d.id}><small>{new Date(d.created_at).toLocaleDateString('fa-IR')}</small><h3>{d.title}</h3><p>{d.summary?.slice(0,260)}</p></article>)}</div></Card></div></div>
}
