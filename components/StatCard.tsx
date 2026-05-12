import React from 'react'

export default function StatCard({ title, value, children }: { title: string, value: string | number, children?: React.ReactNode }){
  return (
    <div className="bg-white border border-green-100 shadow-sm p-6 rounded-lg hover:shadow-md transition-shadow">
      <div className="text-sm text-gray-500 font-medium">{title}</div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <div className="text-green-600">{children}</div>
      </div>
    </div>
  )
}
