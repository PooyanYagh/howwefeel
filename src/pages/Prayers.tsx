import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import type { PrayerLine } from '../lib/types'
export default function Prayers(){
 const [items,setItems]=useState<PrayerLine[]>([])
 useEffect(()=>{supabase.from('prayer_lines').select('*').eq('is_active',true).order('id').then(({data})=>setItems(data??[]))},[])
 return <div className="page"><div className="page-title"><div><h2>مناجات</h2><p>جمله‌هایی برای بازگشتن به مرکز، آرامش و اعتماد.</p></div></div><div className="prayer-library">{items.map(x=><Card key={x.id} className="prayer-card"><span className="badge">{x.category}</span><blockquote>«{x.text}»</blockquote></Card>)}</div></div>
}
