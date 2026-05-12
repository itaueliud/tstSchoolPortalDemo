import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import type { UserRole } from '../../src/auth'
import { getRoleMenuItems } from '../../src/navigation'
import { FileText, CheckCircle2 } from 'lucide-react'

type SectionContent = {
  summary: string
  stats: Array<{ label: string; value: string }>
  tasks: string[]
  updates: string[]
}

const validRoles: UserRole[] = ['admin', 'teacher', 'student', 'parent']

const roleSectionContent: Record<UserRole, Record<string, SectionContent>> = {
  admin: {
    stats: {
      summary: 'Institution-wide student and staff distribution with real-time enrollment snapshots.',
      stats: [
        { label: 'Total Students', value: '842' },
        { label: 'Teaching Staff', value: '45' },
        { label: 'Support Staff', value: '28' },
      ],
      tasks: ['Review student-to-teacher ratio by class band', 'Validate new admissions from this week', 'Approve pending staff profile updates'],
      updates: ['14 new students joined Form 1 this week', '2 staff onboarding profiles pending approval', 'Student transfers reconciled for May intake'],
    },
    analytics: {
      summary: 'Performance trends and operational health metrics across attendance and fee collection.',
      stats: [
        { label: 'Attendance Trend', value: '89%' },
        { label: 'Fee Collection', value: '70%' },
        { label: 'Growth (YoY)', value: '+12%' },
      ],
      tasks: ['Compare attendance trend against last term', 'Export fee trend by class for bursar', 'Flag low-attendance cohorts for intervention'],
      updates: ['Form 3 attendance improved by 6%', 'Fee collection rose 4% this month', 'Top performing stream: Form 4A'],
    },
    users: {
      summary: 'Manage access, identities, and account statuses for all portal users.',
      stats: [
        { label: 'Active Accounts', value: '1,043' },
        { label: 'Pending Invites', value: '17' },
        { label: 'Locked Accounts', value: '4' },
      ],
      tasks: ['Approve new teacher accounts', 'Disable inactive alumni parent accounts', 'Audit admin privileges by department'],
      updates: ['3 parent accounts reactivated', 'New deputy principal account created', 'Weekly access audit completed'],
    },
    fees: {
      summary: 'Track paid, pending, and overdue balances with class-level breakdowns.',
      stats: [
        { label: 'Collected', value: 'KES 1,120,600' },
        { label: 'Pending', value: 'KES 470,200' },
        { label: 'Overdue', value: 'KES 98,000' },
      ],
      tasks: ['Send reminders to overdue balances', 'Confirm sponsor payments posted today', 'Review waiver requests for approval'],
      updates: ['12 families paid today via M-Pesa', 'Bursary reconciliation completed', '4 waiver requests awaiting principal review'],
    },
    settings: {
      summary: 'Control permissions, security policies, and institution-level configuration.',
      stats: [
        { label: 'Roles Defined', value: '12' },
        { label: 'Policy Rules', value: '27' },
        { label: '2FA Adoption', value: '84%' },
      ],
      tasks: ['Enforce password expiration policy', 'Review API key usage and revoke stale keys', 'Update term dates in portal settings'],
      updates: ['Password policy updated to 12 chars', '2FA reminder sent to non-compliant users', 'Term calendar adjusted for June break'],
    },
    reports: {
      summary: 'Generate and export operational and academic reports for stakeholders.',
      stats: [
        { label: 'Saved Reports', value: '31' },
        { label: 'Exports (7d)', value: '53' },
        { label: 'Scheduled Jobs', value: '8' },
      ],
      tasks: ['Generate monthly board report', 'Export attendance by grade level', 'Schedule weekly finance summary'],
      updates: ['Board report draft generated', 'CSV export template updated', 'Automated Monday report job running'],
    },
    announcements: {
      summary: 'Publish school-wide notices and monitor acknowledgement rates.',
      stats: [
        { label: 'Active Notices', value: '6' },
        { label: 'Read Rate', value: '91%' },
        { label: 'Pinned', value: '2' },
      ],
      tasks: ['Publish exam timetable reminder', 'Pin next PTA meeting notice', 'Archive expired transport notice'],
      updates: ['Holiday notice viewed by 96% users', 'Sports day notice scheduled for Friday', 'Emergency contact update published'],
    },
  },
  teacher: {
    classes: {
      summary: 'Daily class schedule, room allocation, and learner counts for instruction planning.',
      stats: [
        { label: 'Classes Today', value: '4' },
        { label: 'Total Learners', value: '126' },
        { label: 'Lab Sessions', value: '2' },
      ],
      tasks: ['Prepare Form 4A lesson resources', 'Confirm lab availability for science block', 'Share class objectives with students'],
      updates: ['Form 3B moved to Room 9', 'Math remedial class added Friday', 'Attendance sheet synced for all classes'],
    },
    attendance: {
      summary: 'Capture attendance quickly and track absences, lateness, and follow-up actions.',
      stats: [
        { label: 'Marked Today', value: '118' },
        { label: 'Absentees', value: '6' },
        { label: 'Late Arrivals', value: '2' },
      ],
      tasks: ['Mark Form 4C attendance before 9:15', 'Flag repeat absentees for follow-up', 'Send absentee summary to class teacher'],
      updates: ['Attendance submitted for all morning classes', 'Two late arrivals logged in Form 3A', 'Parent follow-up started for 3 students'],
    },
    assignments: {
      summary: 'Manage assignment publication, due dates, and submission completion.',
      stats: [
        { label: 'Active Assignments', value: '8' },
        { label: 'Submitted', value: '82%' },
        { label: 'Due This Week', value: '3' },
      ],
      tasks: ['Post algebra revision worksheet', 'Upload science lab rubric', 'Review late submissions queue'],
      updates: ['Form 4A homework posted', '28/32 science reports submitted', 'Reminder sent for essay deadline'],
    },
    grades: {
      summary: 'Record scores, moderate grading, and finalize term assessments.',
      stats: [
        { label: 'Pending Grades', value: '23' },
        { label: 'Finalized', value: '67' },
        { label: 'Needs Moderation', value: '5' },
      ],
      tasks: ['Submit mid-term mathematics grades', 'Moderate borderline scripts', 'Publish Form 3B quiz results'],
      updates: ['12 grades approved this morning', 'Moderation complete for Science CAT', 'Exam committee review scheduled tomorrow'],
    },
    performance: {
      summary: 'Monitor subject trends and identify learners needing intervention.',
      stats: [
        { label: 'Math Average', value: '84%' },
        { label: 'Science Average', value: '79%' },
        { label: 'Improvement', value: '+4%' },
      ],
      tasks: ['Review low-performing cohort in Form 3B', 'Assign remedial sets by topic', 'Share analytics with HOD'],
      updates: ['Top gain in Algebra (+7%)', 'Science practical scores stable', 'Revision plan uploaded to LMS'],
    },
    messaging: {
      summary: 'Coordinate communication with students and guardians from one inbox.',
      stats: [
        { label: 'Unread Messages', value: '9' },
        { label: 'Sent Today', value: '14' },
        { label: 'Parent Threads', value: '6' },
      ],
      tasks: ['Reply to parent grade inquiry', 'Send assignment reminders', 'Share class update with guardians'],
      updates: ['3 parent conversations resolved', 'Broadcast reminder delivered', 'New student question awaiting response'],
    },
  },
  student: {
    timetable: {
      summary: 'View weekly class schedule, subjects, and instructor allocations.',
      stats: [
        { label: 'Classes This Week', value: '32' },
        { label: 'Next Class', value: 'Math 09:00' },
        { label: 'Free Slots', value: '4' },
      ],
      tasks: ['Check Friday timetable changes', 'Set reminders for lab sessions', 'Download printable weekly schedule'],
      updates: ['Science moved to Lab 2 on Wednesday', 'PE starts 30 minutes earlier Friday', 'History slot swapped with Geography'],
    },
    assignments: {
      summary: 'Track coursework deadlines and submission completion in one place.',
      stats: [
        { label: 'Open Tasks', value: '3' },
        { label: 'Submitted', value: '11' },
        { label: 'Overdue', value: '1' },
      ],
      tasks: ['Finish mathematics assignment 5', 'Submit English essay draft', 'Review teacher feedback comments'],
      updates: ['Science project marked in progress', 'Essay due date extended by 2 days', 'Late submission warning on one task'],
    },
    results: {
      summary: 'Access term exam and test performance with grade trends.',
      stats: [
        { label: 'Current GPA', value: '3.8' },
        { label: 'Top Subject', value: 'Mathematics' },
        { label: 'Trend', value: '+0.2' },
      ],
      tasks: ['Review detailed term 1 report card', 'Compare latest mid-term scores', 'Discuss performance goals with mentor'],
      updates: ['Math score improved to 92%', 'Science rose by 5 points', 'Mentor review meeting set for Friday'],
    },
    attendance: {
      summary: 'Check daily attendance and punctuality records for the current term.',
      stats: [
        { label: 'Attendance', value: '92%' },
        { label: 'Absent Days', value: '4' },
        { label: 'Late Marks', value: '2' },
      ],
      tasks: ['Confirm absence notes are submitted', 'Review lateness on Tuesday classes', 'Maintain above 95% attendance target'],
      updates: ['No absences this week', 'One late mark from transport delay', 'Attendance trend improving'],
    },
    fees: {
      summary: 'Track fee statements, outstanding balances, and payment receipts.',
      stats: [
        { label: 'Balance', value: 'KES 12,450' },
        { label: 'Paid This Term', value: 'KES 45,000' },
        { label: 'Due Date', value: '2026-06-05' },
      ],
      tasks: ['Download latest fee statement', 'Share payment receipt with bursar', 'Set reminder for next installment'],
      updates: ['Last payment confirmed', 'Receipt generated for April installment', 'Installment reminder sent to guardian'],
    },
    notifications: {
      summary: 'Receive school alerts, class notices, and assignment reminders.',
      stats: [
        { label: 'Unread Alerts', value: '5' },
        { label: 'Today', value: '2' },
        { label: 'Priority', value: '1' },
      ],
      tasks: ['Open exam timetable alert', 'Acknowledge sports day notice', 'Read teacher announcement for Form 4A'],
      updates: ['New exam notice published', 'PTA communication shared', 'Assignment due reminder delivered'],
    },
  },
  parent: {
    progress: {
      summary: 'Follow your child’s performance trends and subject-by-subject progress.',
      stats: [
        { label: 'Current GPA', value: '3.8' },
        { label: 'Top Subject', value: 'Math' },
        { label: 'Improvement', value: '+6%' },
      ],
      tasks: ['Review latest report card', 'Set learning goals for next month', 'Schedule follow-up with class teacher'],
      updates: ['Science grade improved this term', 'Homework completion at 95%', 'Teacher shared new revision plan'],
    },
    attendance: {
      summary: 'Monitor attendance consistency and quickly review absence reasons.',
      stats: [
        { label: 'Attendance', value: '92%' },
        { label: 'Absences', value: '4' },
        { label: 'Late Days', value: '2' },
      ],
      tasks: ['Confirm reason for April absence', 'Review attendance trend chart', 'Acknowledge class teacher note'],
      updates: ['No absences this week', 'Late mark logged Tuesday', 'Attendance alert threshold not triggered'],
    },
    fees: {
      summary: 'View invoices, payments, and upcoming fee deadlines for your child.',
      stats: [
        { label: 'Paid', value: 'KES 45,000' },
        { label: 'Due', value: 'KES 8,500' },
        { label: 'Next Deadline', value: '2026-06-05' },
      ],
      tasks: ['Pay current balance installment', 'Download official payment receipt', 'Check bursary eligibility update'],
      updates: ['Latest installment posted successfully', 'Receipt emailed to parent account', 'Bursar office updated fee statement'],
    },
    communication: {
      summary: 'Keep in touch with teachers and school administration in one thread.',
      stats: [
        { label: 'Unread Messages', value: '3' },
        { label: 'Teacher Replies', value: '7' },
        { label: 'Open Threads', value: '2' },
      ],
      tasks: ['Reply to class teacher progress note', 'Send transport concern to admin', 'Acknowledge exam prep bulletin'],
      updates: ['Teacher replied on science performance', 'Parent query escalated to deputy', 'New reminder from bursar received'],
    },
    announcements: {
      summary: 'Read official school notices and event updates from administration.',
      stats: [
        { label: 'Active Notices', value: '6' },
        { label: 'Unread', value: '1' },
        { label: 'Upcoming Events', value: '3' },
      ],
      tasks: ['Read PTA meeting announcement', 'Confirm sports day attendance', 'Review holiday calendar notice'],
      updates: ['PTA meeting set for Saturday', 'Exam timetable notice posted', 'Holiday communication updated'],
    },
  },
}

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

  const content = roleSectionContent[role]?.[selected.slug]

  if (!content) {
    return (
      <Layout role={role}>
        <div className="md:col-span-3 card p-6">
          <h2 className="text-xl font-semibold text-gray-900">{selected.label}</h2>
          <p className="text-gray-600 mt-2">This section is not available for your role.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout role={role}>
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-3 mb-3">
          <FileText className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">{selected.label}</h2>
        </div>
        <p className="text-gray-600">{content.summary}</p>
      </div>

      {content.stats.map((stat) => (
        <div key={stat.label} className="card p-6">
          <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}

      <div className="md:col-span-2 card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Queue</h3>
        <div className="space-y-3">
          {content.tasks.map((task) => (
            <div key={task} className="flex items-start gap-2 p-3 border border-gray-100 rounded-lg">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
              <p className="text-sm text-gray-700">{task}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h3>
        <div className="space-y-3">
          {content.updates.map((update) => (
            <div key={update} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900">{update}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

