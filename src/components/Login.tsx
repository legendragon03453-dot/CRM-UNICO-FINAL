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
    <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center p-4 relative overflow-hidden font-outfit">
      {/* Absolute Designer Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-500/5 rounded-full blur-[180px] animate-pulse"></div>

      <div className="w-full max-w-xl animate-fade-in-up relative z-10">
        <div className="bg-zinc-950/80 backdrop-blur-3xl p-16 md:p-24 rounded-[64px] border border-zinc-900 shadow-[0_50px_100px_rgba(0,0,0,1)] text-center">
          <div className="mb-20">
            <h1 className="text-8xl font-black text-white tracking-tighter mb-4 leading-none italic">UNICO</h1>
            <p className="text-zinc-600 text-[10px] uppercase tracking-[0.8em] font-light flex items-center justify-center gap-4">
              <Sparkles size={14} className="text-purple-500" />
              Elite Designer Studio CRM
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-10 text-left">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] ml-2 italic">Usuário Studio</label>
              <div className="relative group">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-purple-400 transition-colors duration-500"><Mail size={20} /></span>
                <input 
                  type="email" 
                  required
                  placeholder="DIGITE SEU EMAIL ELITE"
                  className="w-full bg-black border-2 border-zinc-900 rounded-[28px] pl-20 pr-8 py-6 text-[12px] font-bold text-white tracking-[0.2em] focus:outline-none focus:border-purple-500/30 transition-all duration-500 placeholder:text-zinc-900"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic">Chave de Segurança</label>
                <a href="#" className="text-[9px] text-zinc-500 hover:text-white font-black uppercase tracking-widest transition-colors mb-1 border-b border-zinc-900">Suporte</a>
              </div>
              <div className="relative group">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-purple-400 transition-colors duration-500"><Lock size={20} /></span>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-black border-2 border-zinc-900 rounded-[28px] pl-20 pr-8 py-6 text-[12px] font-bold text-white tracking-[0.2em] focus:outline-none focus:border-purple-500/30 transition-all duration-500 placeholder:text-zinc-900"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/5 border border-red-500/10 text-red-500/80 text-[10px] p-6 rounded-2xl font-black uppercase tracking-widest flex items-center gap-4 animate-shake">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black py-7 rounded-[28px] font-black text-xs uppercase tracking-[0.5em] hover:bg-purple-400 transition-all duration-700 transform hover:scale-[1.02] active:scale-95 shadow-2xl flex items-center justify-center gap-4 disabled:opacity-20 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-black/10 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={20} strokeWidth={3} className="group-hover:translate-x-2 transition-transform duration-500" />
                  Sincronizar Acesso
                </>
              )}
            </button>
          </form>

          <footer className="mt-24 text-[8px] text-zinc-900 font-extrabold uppercase tracking-[0.8em]">
            Plataforma UNICO-S © Todos os direitos reservados.
          </footer>
        </div>
      </div>
    </div>
  )
}
