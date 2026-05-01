import { useState } from 'react'
import { supabase } from '../lib/supabase'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default function AuthScreen({ darkMode = false }) {
  const dk = darkMode
  const [view, setView]       = useState('sign_in')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  async function handleGoogleSignIn() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (view === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      setMessage(error ? { error: error.message } : { ok: 'Check your email for a reset link.' })
      setLoading(false)
      return
    }

    const { error } =
      view === 'sign_up'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

    if (error) setMessage({ error: error.message })
    else if (view === 'sign_up') setMessage({ ok: 'Check your email to confirm your account.' })
    setLoading(false)
  }

  const inputCls = `w-full bg-transparent text-[14px] py-3 px-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors placeholder:text-gray-500 ${
    dk
      ? 'border-white/[0.08] text-white'
      : 'border-gray-200 text-gray-900'
  }`

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${dk ? 'bg-black' : 'bg-[#f2f2f7]'}`}>
      <div className={`w-full max-w-sm rounded-3xl p-8 transition-colors duration-300 ${
        dk
          ? 'bg-[#111111] border border-white/[0.08] shadow-2xl shadow-black/60'
          : 'bg-white shadow-xl shadow-black/[0.06]'
      }`}>

        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className={`text-[56px] font-black tracking-[-0.04em] leading-none mb-3 ${dk ? 'text-white' : 'text-[#0a0a0a]'}`}>
            bulkr
          </h1>
          <p className={`text-[13px] font-medium tracking-wide ${dk ? 'text-gray-500' : 'text-gray-400'}`}>
            Scale your strength.
          </p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border font-semibold text-[14px] transition-all duration-200 active:scale-[0.98] ${
            dk
              ? 'bg-white/[0.06] border-white/20 text-white hover:bg-white/10 hover:border-white/30'
              : 'bg-white border-gray-200 text-gray-800 shadow-md hover:shadow-lg hover:bg-gray-50'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <GoogleIcon />
          {loading ? 'Redirecting…' : 'Sign in with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className={`flex-1 h-px ${dk ? 'bg-white/[0.08]' : 'bg-gray-200'}`} />
          <span className={`text-[11px] font-medium ${dk ? 'text-gray-600' : 'text-gray-400'}`}>or</span>
          <div className={`flex-1 h-px ${dk ? 'bg-white/[0.08]' : 'bg-gray-200'}`} />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputCls}
          />
          {view !== 'forgot' && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputCls}
            />
          )}

          {message?.error && (
            <p className="text-[12px] text-red-400 px-1">{message.error}</p>
          )}
          {message?.ok && (
            <p className="text-[12px] text-emerald-400 px-1">{message.ok}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full bg-[#007aff] text-white font-semibold text-[14px] py-3 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading
              ? '…'
              : view === 'sign_in'
              ? 'Sign in'
              : view === 'sign_up'
              ? 'Create account'
              : 'Send reset link'}
          </button>
        </form>

        {/* Footer links */}
        <div className={`flex justify-between mt-4 text-[12px] ${dk ? 'text-gray-600' : 'text-gray-400'}`}>
          {view === 'sign_in' ? (
            <>
              <button type="button" onClick={() => { setView('forgot'); setMessage(null) }} className="hover:underline">
                Forgot password?
              </button>
              <button type="button" onClick={() => { setView('sign_up'); setMessage(null) }} className="hover:underline">
                Create account
              </button>
            </>
          ) : (
            <button type="button" onClick={() => { setView('sign_in'); setMessage(null) }} className="hover:underline">
              Back to sign in
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
