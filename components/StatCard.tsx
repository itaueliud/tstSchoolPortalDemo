import React from 'react'

export default function StatCard({ title, value, children }: { title: string, value: string | number, children?: React.ReactNode }){
  return (
    <div className="card p-4 rounded-lg neon-glow">
      <div className="text-sm text-white/60">{title}</div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-semibold">{value}</div>
        <div>{children}</div>
      </div>
    </div>
  )
}
