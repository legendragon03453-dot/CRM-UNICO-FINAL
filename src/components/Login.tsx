import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Mail, Lock, LogIn, ShieldCheck } from 'lucide-react'

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
    <div className="min-h-screen w-full bg-[#14130E] flex flex-col lg:flex-row font-outfit selection:bg-white/10 selection:text-black overflow-hidden relative">
      
      {/* BACKGROUND IMAGE FOR MOBILE / RIGHT COLUMN FOR DESKTOP */}
      <div className="lg:hidden absolute inset-0 z-0">
         <img 
          src="https://github.com/legendragon03453-dot/FILIPPO-SITE/blob/main/aes%202%201.png?raw=true" 
          alt="BG" 
          className="w-full h-full object-cover opacity-30 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14130E] via-[#14130E]/80 to-transparent"></div>
      </div>

      {/* FORM COLUMN */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 lg:p-24 relative z-10">
        <div className="w-full max-w-lg space-y-16 animate-fade-in-up">
          
          <div className="space-y-6">
            <img src="https://github.com/legendragon03453-dot/FILIPPO-SITE/blob/main/U.webp?raw=true" alt="U" className="w-20 h-auto grayscale brightness-200" />
            <div>
              <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-4 italic uppercase">UNICO STUDIO</h1>
              <p className="text-zinc-600 text-[10px] uppercase tracking-[0.8em] font-light">OPERATIONAL CONTROL COMMAND</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-12">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] flex items-center gap-3">
                <Mail size={12} /> ACESSO OPERADOR
              </label>
              <input 
                type="email" 
                required
                placeholder="EMAIL@ESTUDIO.COM"
                className="w-full bg-[#1C1B16] border-2 border-[#2A2922] p-8 text-[11px] font-black text-white tracking-[0.3em] outline-none focus:border-white transition-all duration-500 placeholder:text-zinc-800 uppercase"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] flex items-center gap-3">
                <Lock size={12} /> CHAVE DE SEGURANÇA
              </label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-[#1C1B16] border-2 border-[#2A2922] p-8 text-[11px] font-black text-white tracking-[0.3em] outline-none focus:border-white transition-all duration-500 placeholder:text-zinc-800 uppercase"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] p-6 font-black uppercase tracking-widest flex items-center gap-4">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                DADOS INVÁLIDOS NA HQ.
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black py-8 font-black text-xs uppercase tracking-[0.8em] hover:bg-zinc-200 transition-all duration-500 shadow-2xl flex items-center justify-center gap-6 disabled:opacity-50 active:scale-95 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-black/10 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  SINCRONIZAR ⚡️
                </>
              )}
            </button>
          </form>

          <footer className="pt-24 border-t border-[#2A2922] flex items-center justify-between">
            <p className="text-[8px] text-zinc-800 font-black uppercase tracking-widest">ESTOICISMO E PERFORMANCE © 2026</p>
            <ShieldCheck size={16} className="text-zinc-800" />
          </footer>
        </div>
      </div>

      {/* IMAGE COLUMN - DESKTOP ONLY */}
      <div className="hidden lg:block flex-1 bg-black overflow-hidden relative group">
         <img 
          src="https://github.com/legendragon03453-dot/FILIPPO-SITE/blob/main/aes%202%201.png?raw=true" 
          alt="AES" 
          className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 transition-transform duration-[2000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#14130E] via-transparent to-transparent"></div>
        {/* DESIGNER OVERLAY */}
        <div className="absolute bottom-24 right-24 text-right">
           <p className="text-[10px] font-black tracking-[1em] text-white/20 uppercase mb-4">HQ STUDIO LINEAR</p>
           <h2 className="text-4xl font-black text-white/10 italic tracking-tighter uppercase">HIGH FIDELITY CRM</h2>
        </div>
      </div>

    </div>
  )
}
