import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import type { PrayerLine } from '../lib/types'

export default function Prayers() {
  const [items, setItems] = useState<PrayerLine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadPrayers()
  }, [])

  async function loadPrayers() {
    setLoading(true)
    setError(null)

    const { data, error: queryError } = await supabase
      .from('prayer_lines')
      .select('id,text,category,period')
      .eq('is_active', true)
      .order('id')

    if (queryError) {
      console.error('Unable to load prayer lines', queryError)
      setError(queryError.message)
      setItems([])
    } else {
      setItems((data ?? []) as PrayerLine[])
    }
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <h2>مناجات</h2>
          <p>جمله‌هایی برای بازگشتن به مرکز، آرامش و اعتماد.</p>
        </div>
      </div>

      {loading && <div className="empty page-state">در حال دریافت جمله‌ها…</div>}

      {!loading && error && (
        <div className="error-state page-state">
          <b>مناجات دریافت نشد.</b>
          <p>{error}</p>
          <button className="secondary" onClick={() => void loadPrayers()}>
            تلاش دوباره
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="empty page-state">
          هنوز جمله‌ای در جدول <code>prayer_lines</code> وجود ندارد. فایل Seed مناجات را اجرا کن.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="prayer-library">
          {items.map((item) => (
            <Card key={item.id} className="prayer-card">
              <span className="badge">{item.category}</span>
              <blockquote>«{item.text}»</blockquote>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
