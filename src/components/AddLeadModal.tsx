import React, { useState } from 'react'
import { X, User, Globe, Phone, DollarSign, Calendar, Clock, Sparkles } from 'lucide-react'

interface AddLeadModalProps {
  onClose: () => void
  onAdd: (lead: any) => void
}

export const AddLeadModal = ({ onClose, onAdd }: AddLeadModalProps) => {
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
    <div className="fixed inset-0 bg-[#000000]/90 backdrop-blur-3xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-950/80 backdrop-blur-3xl rounded-[40px] border border-zinc-800 shadow-[0_40px_100px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D8B4FE]/30 to-transparent"></div>

        <div className="p-12 pb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-1.5 bg-[#D8B4FE] rounded-full glow-purple"></div>
              <h2 className="text-sm font-black text-[#FFFFFF] tracking-[0.4em] uppercase">Novo Lead Premium</h2>
            </div>
            <p className="text-[10px] text-[#888888] font-light tracking-[0.2em] uppercase">Qualificação Elite no ecossistema UNICO.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white bg-zinc-950/50 backdrop-blur-md border border-zinc-800 p-4 rounded-full transition-all group active:scale-90"
          >
            <X size={18} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-12 pt-6 space-y-10 overflow-y-auto scroll-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {/* Nome */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#333] uppercase tracking-[0.3em] ml-1">Identificação Designer</label>
              <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-[#D8B4FE] transition-colors"><User size={16} /></span>
                <input 
                  type="text" 
                  required
                  placeholder="NOME COMPLETO"
                  className="w-full bg-transparent border-b border-white/5 py-4 pl-8 text-[11px] font-bold text-[#FFFFFF] tracking-widest focus:outline-none focus:border-[#D8B4FE]/50 transition-all placeholder:text-[#222]"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Instagram */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#333] uppercase tracking-[0.3em] ml-1">Social ID</label>
              <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-[#D8B4FE] transition-colors"><Globe size={16} /></span>
                <input 
                  type="text" 
                  placeholder="@ESTUDIO.DESIGN"
                  className="w-full bg-transparent border-b border-white/5 py-4 pl-8 text-[11px] font-bold text-[#FFFFFF] tracking-widest focus:outline-none focus:border-[#D8B4FE]/50 transition-all placeholder:text-[#222]"
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#333] uppercase tracking-[0.3em] ml-1">Direct Line</label>
              <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-[#D8B4FE] transition-colors"><Phone size={16} /></span>
                <input 
                  type="text" 
                  required
                  placeholder="+55 00 00000-0000"
                  className="w-full bg-transparent border-b border-white/5 py-4 pl-8 text-[11px] font-bold text-[#FFFFFF] tracking-widest focus:outline-none focus:border-[#D8B4FE]/50 transition-all placeholder:text-[#222]"
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
            </div>

            {/* Faturamento */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#333] uppercase tracking-[0.3em] ml-1">Ticket Potencial</label>
              <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-[#22C55E] transition-colors"><DollarSign size={16} /></span>
                <input 
                  type="number" 
                  required
                  placeholder="0000.00"
                  className="w-full bg-transparent border-b border-white/5 py-4 pl-8 text-[11px] font-bold text-[#FFFFFF] tracking-widest focus:outline-none focus:border-[#22C55E]/50 transition-all placeholder:text-[#222]"
                  onChange={(e) => setFormData({ ...formData, faturamento_estimado: e.target.value })}
                />
              </div>
            </div>

            {/* Data */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#333] uppercase tracking-[0.3em] ml-1">Timeline Designer</label>
              <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-[#D8B4FE] transition-colors"><Calendar size={16} /></span>
                <input 
                  type="text" 
                  placeholder="EX: SEGUNDA-FEIRA"
                  className="w-full bg-transparent border-b border-white/5 py-4 pl-8 text-[11px] font-bold text-[#FFFFFF] tracking-widest focus:outline-none focus:border-[#D8B4FE]/50 transition-all placeholder:text-[#222]"
                  onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
                />
              </div>
            </div>

            {/* Horário */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#333] uppercase tracking-[0.3em] ml-1">Exclusive Slot</label>
              <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-[#D8B4FE] transition-colors"><Clock size={16} /></span>
                <input 
                  type="text" 
                  placeholder="00:00"
                  className="w-full bg-transparent border-b border-white/5 py-4 pl-8 text-[11px] font-bold text-[#FFFFFF] tracking-widest focus:outline-none focus:border-[#D8B4FE]/50 transition-all placeholder:text-[#222]"
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row gap-6">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-6 bg-zinc-950/50 backdrop-blur-md border border-zinc-900 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all rounded-2xl active:scale-95"
            >
              Descartar Proposta
            </button>
            <button 
              type="submit" 
              className="flex-[2] bg-[#FFFFFF] text-[#000000] py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-[#D8B4FE] transition-all duration-500 transform hover:scale-[1.02] shadow-2xl shadow-white/5 flex items-center justify-center gap-3 active:scale-95"
            >
              <Sparkles size={16} strokeWidth={3} className="text-black" />
              CONECTAR AO ECOSSISTEMA
            </button>
          </div>
        </form>

        <div className="p-8 pt-0 text-center">
          <p className="text-[8px] text-[#222] font-black uppercase tracking-[0.2em]">© UNICO DESIGNER STUDIO CRM - SECURE DATA INPUT</p>
        </div>
      </div>
    </div>
  )
}
