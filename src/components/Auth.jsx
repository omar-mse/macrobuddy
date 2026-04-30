import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  return (
    <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">MacroBuddy</h1>
        <p className="text-sm text-center text-gray-500 mb-6">Track your nutrition with AI</p>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#3b82f6',
                  brandAccent: '#2563eb',
                  inputBackground: '#f9fafb',
                  inputBorder: '#e5e7eb',
                  inputBorderFocus: '#3b82f6',
                },
                borderWidths: { buttonBorderWidth: '0px', inputBorderWidth: '1px' },
                radii: { borderRadiusButton: '10px', inputBorderRadius: '10px' },
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
