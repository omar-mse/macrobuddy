import { X, LogOut, RefreshCw } from 'lucide-react'

export default function SettingsModal({ onClose, onLogout, onRecalculate, darkMode = false }) {
  const dk = darkMode

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
      style={{ background: dk ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.18)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full max-w-sm rounded-3xl overflow-hidden backdrop-blur-2xl border transition-colors duration-300 ${
          dk
            ? 'bg-white/[0.07] border-white/[0.10] shadow-2xl shadow-black/60'
            : 'bg-white/60 border-white/70 shadow-2xl shadow-black/10'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span className={`text-[11px] font-semibold uppercase tracking-widest ${dk ? 'text-gray-500' : 'text-gray-400'}`}>
            Settings
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
              dk ? 'bg-white/10 text-gray-400 hover:bg-white/20' : 'bg-black/[0.06] text-gray-500 hover:bg-black/10'
            }`}
          >
            <X size={13} />
          </button>
        </div>

        {/* Actions */}
        <div className="px-4 pb-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onRecalculate}
            className={`w-full flex items-center justify-center gap-2 text-[15px] font-semibold py-3.5 rounded-2xl active:scale-[0.98] transition-all border ${
              dk
                ? 'bg-white/[0.08] border-white/[0.10] text-white hover:bg-white/[0.13]'
                : 'bg-white/60 border-white/80 text-gray-800 hover:bg-white/90 shadow-sm'
            }`}
          >
            <RefreshCw size={15} />
            Recalculate Goals
          </button>

          <button
            type="button"
            onClick={onLogout}
            className={`w-full flex items-center justify-center gap-2 text-[15px] font-semibold py-3.5 rounded-2xl active:scale-[0.98] transition-all border ${
              dk
                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/[0.16]'
                : 'bg-red-50/80 border-red-200/60 text-red-500 hover:bg-red-100/80'
            }`}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
