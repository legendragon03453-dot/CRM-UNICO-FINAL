import React, { useState } from 'react'
import { X, User, Globe, Phone, DollarSign, Calendar, Clock, Sparkles, UserCheck } from 'lucide-react'

interface AddLeadModalProps {
  onClose: () => void
  onAdd: (lead: any) => void
  profile?: any
}

export const AddLeadModal = ({ onClose, onAdd, profile }: AddLeadModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    instagram: '',
    whatsapp: '',
    faturamento_estimado: '',
    dia: '',
    horario: '',
    status: 'iniciou_atendimento'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      ...formData,
      faturamento_estimado: Number(formData.faturamento_estimado)
    })
  }

  return (
    <div className="fixed inset-0 bg-[#000000]/95 backdrop-blur-3xl flex items-center justify-center p-4 z-[200] animate-in fade-in duration-700 overflow-y-auto">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-900 rounded-[64px] shadow-[0_60px_150px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col max-h-[95vh] my-auto">
        
        {/* Designer Header */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>

        <div className="p-16 pb-10 flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.8)]"></div>
              <h2 className="text-sm font-black text-white tracking-[0.6em] uppercase italic">Captação Elite</h2>
            </div>
            <p className="text-[11px] text-zinc-600 font-bold tracking-[0.2em] uppercase leading-relaxed max-w-xs">Inserindo novos dados estratégicos no ecossistema de alta fidelidade UNICO.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-700 hover:text-white bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-full transition-all duration-500 group active:scale-90"
          >
            <X size={24} className="group-hover:rotate-180 transition-transform duration-700" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-16 pt-0 space-y-16 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {/* Nome */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] ml-2 italic">Nome Personalizado</label>
              <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-purple-400 transition-colors duration-500"><User size={18} /></span>
                <input 
                  type="text" 
                  required
                  placeholder="DIGITE O NOME COMPLETO"
                  className="w-full bg-transparent border-b-2 border-zinc-900 py-6 pl-10 text-xs font-black text-white tracking-[0.3em] focus:outline-none focus:border-purple-500/50 transition-all duration-500 placeholder:text-zinc-700 uppercase"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Social */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] ml-2 italic">Identidade Social</label>
              <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-purple-400 transition-colors duration-500"><Globe size={18} /></span>
                <input 
                  type="text" 
                  placeholder="@USUARIO.INSTAGRAM"
                  className="w-full bg-transparent border-b-2 border-zinc-900 py-6 pl-10 text-xs font-black text-white tracking-[0.3em] focus:outline-none focus:border-purple-500/50 transition-all duration-500 placeholder:text-zinc-700 uppercase"
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                />
              </div>
            </div>

            {/* Direct Line */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] ml-2 italic">Linha Direta (WhatsApp)</label>
              <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-purple-400 transition-colors duration-500"><Phone size={18} /></span>
                <input 
                  type="text" 
                  required
                  placeholder="+55 (00) 00000-0000"
                  className="w-full bg-transparent border-b-2 border-zinc-900 py-6 pl-10 text-xs font-black text-white tracking-[0.3em] focus:outline-none focus:border-purple-500/50 transition-all duration-500 placeholder:text-zinc-700 uppercase"
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] ml-2 italic">Budget do Projeto</label>
              <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-green-500 transition-colors duration-500"><DollarSign size={18} /></span>
                <input 
                  type="number" 
                  required
                  placeholder="EX: 15.000,00"
                  className="w-full bg-transparent border-b-2 border-zinc-900 py-6 pl-10 text-xs font-black text-white tracking-[0.3em] focus:outline-none focus:border-green-500/50 transition-all duration-500 placeholder:text-zinc-700"
                  onChange={(e) => setFormData({ ...formData, faturamento_estimado: e.target.value })}
                />
              </div>
            </div>

            {/* Data */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] ml-2 italic">Dia Sugerido</label>
              <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-purple-400 transition-colors duration-500"><Calendar size={18} /></span>
                <input 
                  type="text" 
                  placeholder="EX: SEGUNDA-FEIRA"
                  className="w-full bg-transparent border-b-2 border-zinc-900 py-6 pl-10 text-xs font-black text-white tracking-[0.3em] focus:outline-none focus:border-purple-500/50 transition-all duration-500 placeholder:text-zinc-700 uppercase"
                  onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
                />
              </div>
            </div>

            {/* Horário */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] ml-2 italic">Horário de Atendimento</label>
              <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-purple-400 transition-colors duration-500"><Clock size={18} /></span>
                <input 
                  type="text" 
                  placeholder="EX: 14:30"
                  className="w-full bg-transparent border-b-2 border-zinc-900 py-6 pl-10 text-xs font-black text-white tracking-[0.3em] focus:outline-none focus:border-purple-500/50 transition-all duration-500 placeholder:text-zinc-700 uppercase"
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-20 flex flex-col md:flex-row gap-10">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-8 bg-zinc-950 border-2 border-zinc-900 text-[11px] font-black uppercase tracking-[0.5em] text-zinc-700 hover:text-white hover:border-zinc-700 transition-all duration-700 rounded-full active:scale-95"
            >
              Descartar
            </button>
            <button 
              type="submit" 
              className="flex-[2] bg-white text-black py-8 rounded-full font-black text-[11px] uppercase tracking-[0.6em] hover:bg-purple-400 transition-all duration-700 transform hover:scale-[1.02] shadow-[0_20px_60px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 active:scale-95 group"
            >
              <Sparkles size={20} strokeWidth={3} className="text-black group-hover:rotate-90 transition-transform duration-700" />
              Ingressar no Ecossistema
            </button>
          </div>
        </form>

        <div className="p-12 pt-0 text-center flex flex-col items-center gap-4">
           {profile && (
             <div className="flex items-center gap-2 px-6 py-3 bg-zinc-900/30 rounded-full border border-zinc-800 shadow-inner">
               <UserCheck size={14} className="text-purple-400" />
               <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">Operador Responsável: <span className="text-white">{profile.full_name}</span></p>
             </div>
           )}
          <p className="text-[9px] text-zinc-900 font-extrabold uppercase tracking-[1em]">UNICO DESIGN SYSTEM © SECURE DATA FLOW</p>
        </div>
      </div>
    </div>
  )
}
