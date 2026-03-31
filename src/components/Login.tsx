import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center p-4 relative overflow-hidden font-family-outfit">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D8B4FE]/5 rounded-full blur-[180px] animate-pulse"></div>

      <div className="w-full max-w-lg animate-fade-in-up relative">
        <div className="glass p-16 rounded-[40px] border-white/5 shadow-[0_40px_100px_rgba(0,0,0,1)]">
          <div className="text-center mb-16">
            <h1 className="text-7xl font-black text-[#FFFFFF] tracking-tighter mb-4 leading-none">UNICO</h1>
            <p className="text-[#888888] text-[10px] uppercase tracking-[0.6em] font-light flex items-center justify-center gap-3">
              <Sparkles size={12} className="text-[#D8B4FE]" />
              Designer Studio CRM
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#333] uppercase tracking-[0.3em] ml-1">Usuário Elite</label>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-[#D8B4FE] transition-colors"><Mail size={18} /></span>
                <input 
                  type="email" 
                  required
                  placeholder="EMAIL@STUDIO.COM"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-16 pr-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-widest focus:outline-none focus:border-[#D8B4FE]/30 focus:bg-white/[0.04] transition-all placeholder:text-[#222]"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-[#333] uppercase tracking-[0.3em]">Chave de Acesso</label>
                <a href="#" className="text-[9px] text-[#888888] hover:text-[#FFFFFF] font-black uppercase tracking-widest transition-colors">Esqueceu?</a>
              </div>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-[#D8B4FE] transition-colors"><Lock size={18} /></span>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-16 pr-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-widest focus:outline-none focus:border-[#D8B4FE]/30 focus:bg-white/[0.04] transition-all placeholder:text-[#222]"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/5 border border-red-500/10 text-red-500/80 text-[10px] p-4 rounded-xl font-black uppercase tracking-widest flex items-center gap-3">
                <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#FFFFFF] text-[#000000] py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#D8B4FE] transition-all duration-500 transform hover:scale-[1.02] active:scale-95 shadow-2xl shadow-white/5 flex items-center justify-center gap-3 disabled:opacity-20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={16} strokeWidth={3} />
                  Acessar Ecossistema
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[9px] text-[#222] font-black uppercase mt-16 tracking-[0.5em]">
            UNICO Design System © MMXXIV
          </p>
        </div>
      </div>
    </div>
  )
}
