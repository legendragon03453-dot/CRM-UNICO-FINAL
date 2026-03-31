import React, { useState } from 'react'
import { X, User, Globe, Phone, DollarSign, Calendar, Clock, Sparkles, UserCheck, Flame, Briefcase } from 'lucide-react'

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
    status: 'iniciou_atendimento',
    temperature: 'frio',
    product_type: 'Produto 4 (Principal)'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      ...formData,
      faturamento_estimado: Number(formData.faturamento_estimado),
      registered_by_name: profile?.full_name || 'Agente Studio'
    })
  }

  const products = ['Produto 1', 'Produto 2', 'Produto 3', 'Produto 4 (Principal)', 'Produto 5']

  return (
    <div className="fixed inset-0 bg-[#000000]/98 backdrop-blur-3xl flex items-center justify-center p-4 z-[200] animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#1C1B16] border border-[#2A2922] rounded-none shadow-[0_60px_150px_rgba(0,0,0,1)] relative flex flex-col max-h-[95vh] my-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5"></div>
        <div className="p-16 pb-10 flex justify-between items-start">
          <div className="space-y-4">
             <h2 className="text-sm font-black text-white tracking-[0.6em] uppercase flex items-center gap-4 italic"><div className="w-2 h-2 bg-white animate-pulse"></div>Captação Elite Linear</h2>
             <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xs">Inserindo novos dados estratégicos no ecossistema UNICO Studio.</p>
          </div>
          <button onClick={onClose} className="text-zinc-700 hover:text-white border border-[#2A2922] p-6 hover:bg-white/5 transition-all outline-none">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-16 pt-0 space-y-16 overflow-y-auto custom-scrollbar scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Designer ID Name</label>
              <div className="relative group border-b-2 border-[#2A2922] focus-within:border-white transition-all">
                <input type="text" required placeholder="NOME COMPLETO" className="w-full bg-transparent py-5 pl-0 text-xs font-black text-white tracking-[0.3em] focus:outline-none placeholder:text-zinc-800 uppercase" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Temperatura do Lead</label>
              <div className="flex bg-[#14130E] border border-[#2A2922]">
                {['frio', 'morno', 'quente'].map(temp => (
                  <button 
                    key={temp} type="button" 
                    onClick={() => setFormData({...formData, temperature: temp})}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${formData.temperature === temp ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Linha Direta (Whatsapp)</label>
              <div className="relative border-b-2 border-[#2A2922] focus-within:border-white transition-all">
                <input type="text" required placeholder="+55 (00) 00000-0000" className="w-full bg-transparent py-5 text-xs font-black text-white tracking-[0.3em] focus:outline-none placeholder:text-zinc-800 uppercase" onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Orçamento Previsto</label>
              <div className="relative border-b-2 border-[#2A2922] focus-within:border-white transition-all">
                <input type="number" required placeholder="0.00" className="w-full bg-transparent py-5 text-xs font-black text-white tracking-[0.3em] focus:outline-none placeholder:text-zinc-800" onChange={(e) => setFormData({ ...formData, faturamento_estimado: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Tipo de Produto</label>
              <select className="w-full bg-[#14130E] border border-[#2A2922] text-[10px] font-black uppercase tracking-widest text-zinc-400 p-5 outline-none focus:border-white transition-all cursor-pointer" value={formData.product_type} onChange={(e) => setFormData({...formData, product_type: e.target.value})}>
                {products.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Rede Social</label>
              <div className="relative border-b-2 border-[#2A2922] focus-within:border-white transition-all">
                <input type="text" placeholder="@USUARIO.DESIGN" className="w-full bg-transparent py-5 text-xs font-black text-white tracking-[0.3em] focus:outline-none placeholder:text-zinc-800 uppercase" onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="pt-20 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-8 border-2 border-[#2A2922] text-[11px] font-black uppercase tracking-[0.5em] text-zinc-600 hover:text-white transition-all">Descartar</button>
            <button type="submit" className="flex-[2] bg-white text-black py-8 font-black text-[11px] uppercase tracking-[0.6em] hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-4">Ingressar no Studio</button>
          </div>
        </form>

        <div className="p-12 pt-0 flex flex-col items-center gap-6 border-t border-[#2A2922]/50">
           {profile && (
             <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-8 border-b border-[#2A2922] pb-1">Operador Studio: {profile.full_name}</p>
           )}
           <p className="text-[9px] text-zinc-800 font-extrabold uppercase tracking-[1em] mb-4">UNICO DESIGN SYSTEM © SECURE DATA</p>
        </div>
      </div>
    </div>
  )
}
