'use client'

import { useMemo } from 'react'

type TimetableEntry = {
  id: string
  teacher_id: string
  school_class_id: string
  school_class: string
  subject: string
  day_of_week: string
  start_time: string
  end_time: string
  room: string
  status: 'pending' | 'completed' | 'missed' | 'rescheduled'
  notes: string
}

type TimetableWeekGridProps = {
  entries: TimetableEntry[]
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const STATUS_COLORS = {
  pending: 'bg-gray-100 border-l-4 border-gray-400',
  completed: 'bg-green-50 border-l-4 border-green-500',
  missed: 'bg-red-50 border-l-4 border-red-500',
  rescheduled: 'bg-orange-50 border-l-4 border-orange-500',
}

const STATUS_TEXT = {
  pending: 'text-gray-700',
  completed: 'text-green-700',
  missed: 'text-red-700',
  rescheduled: 'text-orange-700',
}

export default function TimetableWeekGrid({ entries }: TimetableWeekGridProps) {
  const timeSlots = useMemo(() => {
    const slots = new Set<string>()
    entries.forEach((entry) => {
      slots.add(`${entry.start_time}-${entry.end_time}`)
    })
    return Array.from(slots).sort()
  }, [entries])

  const entriesByDayAndTime = useMemo(() => {
    const map: Record<string, Record<string, TimetableEntry[]>> = {}
    DAY_ORDER.forEach((day) => {
      map[day] = {}
      timeSlots.forEach((slot) => {
        map[day][slot] = []
      })
    })

    entries.forEach((entry) => {
      const slot = `${entry.start_time}-${entry.end_time}`
      if (!map[entry.day_of_week]) {
        map[entry.day_of_week] = {}
      }
      if (!map[entry.day_of_week][slot]) {
        map[entry.day_of_week][slot] = []
      }
      map[entry.day_of_week][slot].push(entry)
    })

    return map
  }, [entries, timeSlots])

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        No timetable entries for this week.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold min-w-24">Time</th>
            {DAY_LABELS.map((day) => (
              <th key={day} className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold min-w-32">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot, idx) => (
            <tr key={slot} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                {slot}
              </td>
              {DAY_ORDER.map((day) => {
                const cellEntries = entriesByDayAndTime[day][slot]
                return (
                  <td key={`${day}-${slot}`} className="border border-gray-300 px-4 py-3 align-top">
                    <div className="space-y-1">
                      {cellEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`p-2 rounded text-xs ${STATUS_COLORS[entry.status] || 'bg-gray-50'}`}
                        >
                          <div className={`font-semibold ${STATUS_TEXT[entry.status] || 'text-gray-700'}`}>
                            {entry.subject}
                          </div>
                          <div className="text-gray-600 text-xs">{entry.school_class}</div>
                          <div className="text-gray-600 text-xs">{entry.room || 'Room N/A'}</div>
                          <div className={`text-xs font-medium mt-1 ${STATUS_TEXT[entry.status] || 'text-gray-700'}`}>
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </div>
                          {entry.notes && <div className="text-gray-500 text-xs italic mt-1">{entry.notes}</div>}
                        </div>
                      ))}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
