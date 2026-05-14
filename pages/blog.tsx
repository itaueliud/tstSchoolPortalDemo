import Link from 'next/link'
import LandingNav from '../components/LandingNav'

export default function Blog() {
  const posts = [
    {
      date: 'May 14, 2026',
      title: '5 Ways to Improve Student Engagement in 2026',
      excerpt: 'Discover practical strategies for keeping students engaged in a digital learning environment...',
      category: 'Education'
    },
    {
      date: 'May 10, 2026',
      title: 'How TST Portal Saves Schools 40 Hours Per Month',
      excerpt: 'Learn how streamlined administration can free up valuable time for educators...',
      category: 'Case Study'
    },
    {
      date: 'May 5, 2026',
      title: 'The Future of School Management Systems',
      excerpt: 'Explore emerging trends in educational technology and what they mean for your school...',
      category: 'Trends'
    },
    {
      date: 'April 28, 2026',
      title: 'Strengthening Parent-School Communication',
      excerpt: 'Best practices for maintaining open and effective lines of communication with parents...',
      category: 'Communication'
    },
    {
      date: 'April 20, 2026',
      title: 'Digital Literacy: A Must-Have for Modern Schools',
      excerpt: 'Why integrating technology into school operations is more important than ever...',
      category: 'Technology'
    },
    {
      date: 'April 15, 2026',
      title: 'Attendance Tracking: More Than Just Numbers',
      excerpt: 'How accurate attendance data can help identify struggling students early...',
      category: 'Data'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100">
      <LandingNav />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            TST Portal <span className="text-[#123a78]">Blog</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tips, insights, and best practices for modern school management.
          </p>
        </div>
      </section>

      {/* BLOG POSTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <article key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-40"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#123a78] bg-blue-50 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-500">{post.date}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{post.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                <a href="#" className="text-[#123a78] text-sm font-semibold hover:text-[#0b1f4d] transition">
                  Read More →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <p>&copy; 2026 TST School Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
