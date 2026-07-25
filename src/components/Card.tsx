import type { ReactNode } from 'react'
export default function Card({ title, subtitle, children, className='' }: {title?: string, subtitle?: string, children: ReactNode, className?: string}) {
  return <section className={`card ${className}`}>
    {(title || subtitle) && <div className="card-head"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div></div>}
    {children}
  </section>
}
