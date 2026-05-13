import Link from 'next/link'

export default function RoleSelect(){
  const roles = ['admin','teacher','student','parent']
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-2">Sign in</h2>
          <p className="text-white/70 mb-4">Choose a role to preview the TechSwiftTrix dashboard.</p>
          <div className="grid grid-cols-2 gap-3">
            {roles.map(r=> (
              <Link key={r} href={`/login?role=${r}`} className="p-3 rounded-lg bg-white/6 text-center">{r.toUpperCase()}</Link>
            ))}
          </div>
        </div>
        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-2">Login (mock)</h2>
          <p className="text-white/70 mb-4">This demo uses mock authentication. Use role selection to proceed.</p>
        </div>
      </div>
    </div>
  )
}
