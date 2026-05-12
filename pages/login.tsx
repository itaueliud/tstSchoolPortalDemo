export default function Login(){
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card p-8 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-2">Login</h2>
        <form className="space-y-4">
          <input placeholder="Email" className="w-full p-3 rounded bg-white/6" />
          <input placeholder="Password" type="password" className="w-full p-3 rounded bg-white/6" />
          <div className="flex items-center justify-between">
            <button className="px-4 py-2 bg-neon text-navy rounded">Sign in</button>
            <a href="/forgot" className="text-sm text-white/70">Forgot?</a>
          </div>
        </form>
      </div>
    </div>
  )
}
