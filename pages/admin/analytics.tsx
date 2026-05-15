'use client'

import AdminStatsPage from './stats'

// For now reuse the admin stats page UI for School Analytics. This keeps the two
// routes separate while sharing the same implementation. We can later
// differentiate the analytics view (different filters or visualizations).
export default function AdminAnalyticsPage() {
  return <AdminStatsPage />
}
