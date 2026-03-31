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
    <div className="min-h-screen w-full bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1E3A8A]/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="card bg-[#111111]/80 backdrop-blur-xl p-10 border-[#262626] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-[#F5F5F5] tracking-tighter mb-2">UNICO</h1>
            <p className="text-[#A0A0A0] text-sm uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-blue-500" />
              Design Studio CRM
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider ml-1">Acesso do Time</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]"><Mail size={18} /></span>
                <input 
                  type="email" 
                  required
                  placeholder="seu@email.com"
                  className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl pl-12 pr-4 py-3.5 text-[#F5F5F5] focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between ml-1">
                <label className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">Chave de Segurança</label>
                <a href="#" className="text-[10px] text-blue-500 hover:text-blue-400 font-bold uppercase">Esqueceu?</a>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]"><Lock size={18} /></span>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl pl-12 pr-4 py-3.5 text-[#F5F5F5] focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg flex items-center gap-2">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#1E3A8A] text-white py-4 rounded-xl font-black text-lg hover:bg-[#2563EB] transition-all transform hover:scale-[1.01] active:scale-95 shadow-xl shadow-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  ACESSAR SISTEMA
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-[#262626] font-bold uppercase mt-8 tracking-tighter">
            Plataforma UNICO © Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
