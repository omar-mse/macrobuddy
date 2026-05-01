import { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function AuthScreen({ darkMode = false }) {
  const [loading, setLoading] = useState(false)
  const dk = darkMode

  async function handleGoogleSignIn() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    setLoading(false)
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        dk ? 'bg-black' : 'bg-[#f2f2f7]'
      }`}
    >
      <div
        className={`w-full max-w-sm rounded-3xl p-8 transition-colors duration-300 ${
          dk
            ? 'bg-[#111111] border border-white/[0.08] shadow-2xl shadow-black/60'
            : 'bg-white shadow-xl shadow-black/[0.06]'
        }`}
      >
        {/* Hero */}
        <div className="text-center mb-8">
          <h1
            className={`text-[56px] font-black tracking-[-0.04em] leading-none mb-3 ${
              dk ? 'text-white' : 'text-[#0a0a0a]'
            }`}
          >
            bulkr
          </h1>
          <p className={`text-[13px] font-medium tracking-wide ${dk ? 'text-gray-500' : 'text-gray-400'}`}>
            Scale your strength.
          </p>
        </div>

        {/* Google Sign In — primary CTA */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border font-semibold text-[14px] transition-all duration-200 ${
            dk
              ? 'bg-white/[0.06] border-white/20 text-white hover:bg-white/[0.10] hover:border-white/30'
              : 'bg-white border-gray-200 text-gray-800 shadow-md hover:shadow-lg hover:bg-gray-50'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}
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

        {/* Email / Password */}
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#3b82f6',
                  brandAccent: '#2563eb',
                  inputBackground: dk ? '#0d0d0d' : '#f2f2f7',
                  inputBorder: dk ? '#1c1c1c' : '#e2e2ea',
                  inputBorderFocus: '#3b82f6',
                  inputText: dk ? '#ffffff' : '#0a0a0a',
                  inputLabelText: dk ? '#6b7280' : '#6b7280',
                  defaultButtonBackground: dk ? '#0d0d0d' : '#f2f2f7',
                  defaultButtonBackgroundHover: dk ? '#1a1a1a' : '#eaeaf0',
                  defaultButtonBorder: dk ? '#1c1c1c' : '#e2e2ea',
                  defaultButtonText: dk ? '#ffffff' : '#374151',
                  messageText: dk ? '#6b7280' : '#9ca3af',
                  anchorTextColor: '#3b82f6',
                  anchorTextHoverColor: '#2563eb',
                },
                borderWidths: { buttonBorderWidth: '1px', inputBorderWidth: '1px' },
                radii: { borderRadiusButton: '20px', inputBorderRadius: '20px' },
              },
            },
          }}
          providers={[]}
          view="sign_in"
          showLinks={true}
        />
      </div>
    </div>
  )
}
