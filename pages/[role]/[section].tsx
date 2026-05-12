import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import type { UserRole } from '../../src/auth'
import { getRoleMenuItems } from '../../src/navigation'
import { FileText } from 'lucide-react'

const validRoles: UserRole[] = ['admin', 'teacher', 'student', 'parent']

export default function RoleSectionPage() {
  const router = useRouter()
  const roleParam = Array.isArray(router.query.role) ? router.query.role[0] : router.query.role
  const sectionParam = Array.isArray(router.query.section) ? router.query.section[0] : router.query.section

  if (!roleParam || !sectionParam || !validRoles.includes(roleParam as UserRole)) {
    return null
  }

  const role = roleParam as UserRole
  const items = getRoleMenuItems(role)
  const selected = items.find((item) => item.slug === sectionParam)

  if (!selected) {
    return null
  }

  return (
    <Layout role={role}>
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-3 mb-3">
          <FileText className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">{selected.label}</h2>
        </div>
        <p className="text-gray-600 mb-4">
          This section is now fully wired into side navigation for the {role} portal.
        </p>
        <p className="text-sm text-gray-500">
          Route: /{role}/{selected.slug}
        </p>
      </div>
    </Layout>
  )
}
