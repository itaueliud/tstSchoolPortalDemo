export default function Forgot(){
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card p-8 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-2">Forgot Password</h2>
        <p className="text-white/70 mb-4">Enter your email to receive reset instructions.</p>
        <form className="space-y-4">
          <input placeholder="Email" className="w-full p-3 rounded bg-white/6" />
          <div className="flex items-center justify-between">
            <button className="px-4 py-2 bg-neon text-navy rounded">Send</button>
            <a href="/login" className="text-sm text-white/70">Back to login</a>
          </div>
        </form>
      </div>
    </div>
  )
}
