import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { useDashboardSummary } from '../../src/useDashboardSummary'
import { requestJson } from '../../src/apiClient'
import { BookOpen, Search, Users, MapPin, UserSquare2 } from 'lucide-react'

type SchoolClassItem = {
  id?: string
  name: string
  grade_level: string
  room: string
  class_teacher: string
  student_count: number
}

const emptyForm = {
  name: '',
  grade_level: '',
  room: '',
  class_teacher: '',
}

export default function AdminClassesPage() {
  const { data, loading, error } = useDashboardSummary('admin')
  const summary = data?.summary || {}
  const summaryValues = summary as Record<string, string | number | undefined>

  const [classes, setClasses] = useState<SchoolClassItem[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [classesError, setClassesError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [notice, setNotice] = useState('')

  const cards = useMemo(() => ([
    { title: 'Total Students', value: Number(summaryValues.students) || 0 },
    { title: 'Teachers', value: Number(summaryValues.teachers) || 0 },
    { title: 'Classes', value: Number(summaryValues.classes) || 0 },
    { title: 'Revenue', value: summaryValues.revenue ? `KES ${summaryValues.revenue}` : 'KES 0' },
  ]), [summaryValues])

  useEffect(() => {
    let active = true

    const loadClasses = async () => {
      setLoadingClasses(true)
      setClassesError('')

      try {
        const query = new URLSearchParams({ page: String(page), page_size: '8' })
        if (search.trim()) query.set('search', search.trim())

        const response = await requestJson<{ classes: SchoolClassItem[]; total_pages: number }>(`/api/dashboard/admin/classes/?${query.toString()}`)
        if (!active) return
        setClasses(response.classes)
        setTotalPages(response.total_pages || 1)
      } catch (loadError) {
        if (active) {
          setClassesError(loadError instanceof Error ? loadError.message : 'Unable to load classes')
        }
      } finally {
        if (active) {
          setLoadingClasses(false)
        }
      }
    }

    loadClasses()

    return () => {
      active = false
    }
  }, [page, search])

  const refreshClasses = async () => {
    const query = new URLSearchParams({ page: String(page), page_size: '8' })
    if (search.trim()) query.set('search', search.trim())

    const response = await requestJson<{ classes: SchoolClassItem[]; total_pages: number }>(`/api/dashboard/admin/classes/?${query.toString()}`)
    setClasses(response.classes)
    setTotalPages(response.total_pages || 1)
  }

  const resetForm = () => {
    setEditingId('')
    setForm(emptyForm)
    setNotice('')
  }

  const startEdit = (schoolClass: SchoolClassItem) => {
    if (!schoolClass.id) return
    setEditingId(schoolClass.id)
    setForm({
      name: schoolClass.name,
      grade_level: schoolClass.grade_level || '',
      room: schoolClass.room || '',
      class_teacher: schoolClass.class_teacher || '',
    })
    setNotice('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setNotice('')

    try {
      const payload = {
        name: form.name.trim(),
        grade_level: form.grade_level.trim(),
        room: form.room.trim(),
        class_teacher: form.class_teacher.trim(),
      }

      if (editingId) {
        await requestJson(`/api/dashboard/admin/classes/${editingId}/`, { method: 'PATCH', body: JSON.stringify(payload) })
        setNotice('Class updated successfully.')
      } else {
        await requestJson('/api/dashboard/admin/classes/', { method: 'POST', body: JSON.stringify(payload) })
        setNotice('Class created successfully.')
      }

      await refreshClasses()
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (classId: string) => {
    if (!window.confirm('Delete this class? Students or teacher assignments must be cleared first.')) return
    await requestJson(`/api/dashboard/admin/classes/${classId}/`, { method: 'DELETE' })
    await refreshClasses()
    if (editingId === classId) {
      resetForm()
    }
  }

  return (
    <Layout role="admin">
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => <StatCard key={card.title} title={card.title} value={card.value} />)}
      </div>

      {loading && <div className="md:col-span-3 text-sm text-white/60">Loading dashboard summary from backend...</div>}
      {error && <div className="md:col-span-3 text-sm text-red-500">{error}</div>}

      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Class Management</h3>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Class name" required />
          <input value={form.grade_level} onChange={(event) => setForm((current) => ({ ...current, grade_level: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Grade level" />
          <input value={form.room} onChange={(event) => setForm((current) => ({ ...current, room: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Room" />
          <input value={form.class_teacher} onChange={(event) => setForm((current) => ({ ...current, class_teacher: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Class teacher" />
          <div className="flex gap-2 sm:col-span-2 xl:col-span-4">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold disabled:opacity-60">{editingId ? 'Update class' : 'Create class'}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white">Clear</button>
          </div>
        </form>

        <div className="mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Search class name, room, or teacher" />
        </div>

        <div className="space-y-3">
          {classes.map((schoolClass) => (
            <div key={schoolClass.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{schoolClass.name}</p>
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {schoolClass.student_count} students
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><UserSquare2 className="w-4 h-4 text-gray-400" />{schoolClass.class_teacher || 'No class teacher assigned'}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" />{schoolClass.room || 'No room set'}</div>
                    <div>{schoolClass.grade_level || 'No grade level set'}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(schoolClass)} className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded hover:bg-green-100">Edit</button>
                  <button type="button" onClick={() => schoolClass.id && handleDelete(schoolClass.id)} className="text-xs font-semibold text-red-700 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page <= 1} className="px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40">Prev</button>
            <button type="button" onClick={() => setPage((current) => Math.min(current + 1, totalPages))} disabled={page >= totalPages} className="px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40">Next</button>
          </div>
        </div>

        {loadingClasses && <p className="mt-3 text-xs text-gray-500">Loading classes...</p>}
        {classesError && <p className="mt-3 text-xs text-red-600">{classesError}</p>}
        {notice && <p className="mt-3 text-xs text-green-700">{notice}</p>}
      </div>
    </Layout>
  )
}
