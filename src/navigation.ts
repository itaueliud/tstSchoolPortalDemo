import type { UserRole } from './auth'

export type NavItem = {
  label: string
  slug: string
  href: string
}

const roleSections: Record<UserRole, Array<{ label: string; slug: string }>> = {
  admin: [
    { label: 'Student & Staff Stats', slug: 'stats' },
    { label: 'School Analytics', slug: 'analytics' },
    { label: 'Class Management', slug: 'classes' },
    { label: 'Timetable Management', slug: 'timetable' },
    { label: 'Attendance Management', slug: 'attendance' },
    { label: 'User Management', slug: 'users' },
    { label: 'Fee Tracking', slug: 'fees' },
    { label: 'System Settings', slug: 'settings' },
    { label: 'Reports & Exports', slug: 'reports' },
    { label: 'Announcements', slug: 'announcements' },
  ],
  teacher: [
    { label: 'Class Management', slug: 'classes' },
    { label: 'Timetable', slug: 'timetable' },
    { label: 'Attendance Marking', slug: 'attendance' },
    { label: 'Assignments & Notes', slug: 'assignments' },
    { label: 'Grade Submission', slug: 'grades' },
    { label: 'Performance Analytics', slug: 'performance' },
    { label: 'Messaging', slug: 'messaging' },
  ],
  student: [
    { label: 'Timetable', slug: 'timetable' },
    { label: 'Assignments & LMS', slug: 'assignments' },
    { label: 'Exam Results', slug: 'results' },
    { label: 'Attendance', slug: 'attendance' },
    { label: 'Fee Balance', slug: 'fees' },
    { label: 'Notifications', slug: 'notifications' },
  ],
  parent: [
    { label: 'Academic Progress', slug: 'progress' },
    { label: 'Attendance Reports', slug: 'attendance' },
    { label: 'Fee Payment', slug: 'fees' },
    { label: 'Teacher Communication', slug: 'communication' },
    { label: 'School Announcements', slug: 'announcements' },
  ],
}

export function getRoleMenuItems(role: UserRole): NavItem[] {
  const base: NavItem[] = [{ label: 'Dashboard', slug: 'dashboard', href: `/${role}/dashboard` }]
  const sections = roleSections[role].map((section) => ({
    ...section,
    href: `/${role}/${section.slug}`,
  }))
  return [...base, ...sections]
}
