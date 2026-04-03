import React, { useState, useEffect } from 'react'
import { X, User, Globe, Phone, DollarSign, Calendar, Clock, Sparkles, UserCheck, Flame, Briefcase, Percent, ChevronRight, CheckCircle2 } from 'lucide-react'

interface AddLeadModalProps {
  onClose: () => void
  onAdd: (lead: any) => void
  profile?: any
}

export const AddLeadModal = ({ onClose, onAdd, profile }: AddLeadModalProps) => {
  const products = [
    { name: 'Produto 1: Identidade Visual + Estratégia de conteúdo', price: 15000 },
    { name: 'Produto 2: Identidade Visual', price: 7000 },
    { name: 'Produto 3: Site Exclusive', price: 5000 },
    { name: 'Mentoria de Criação de Conteúdo', price: 3000 },
    { name: 'Produto 4: Mentoria de Site com IA [Em Grupo]', price: 500 },
    { name: 'Produto 5: Cursos e Afins', price: 197 }
  ]

  const [formData, setFormData] = useState({
    name: '',
    instagram: '',
    whatsapp: '',
    faturamento_estimado: String(products[2].price), 
    dia: '',
    horario: '',
    status: 'novo_lead',
    temperature: 'frio',
    product_type: products[2].name
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      ...formData,
      faturamento_estimado: Number(formData.faturamento_estimado),
      registered_by_name: profile?.full_name || 'Agente Studio'
    })
  }

  const handleProductChange = (productName: string) => {
    const product = products.find(p => p.name === productName)
    if (product) {
      setFormData({
        ...formData,
        product_type: product.name,
        faturamento_estimado: String(product.price)
      })
    }
  }

  const commission = Number(formData.faturamento_estimado) * 0.3

  return (
    <div className="fixed inset-0 bg-[#1E1E24]/95 backdrop-blur-3xl flex items-center justify-center p-4 z-[200] animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#2A2A35] border border-[#363645] rounded-luxury shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="p-8 md:p-12 border-b border-[#363645] flex justify-between items-center bg-[#1E1E24]/50">
          <div className="space-y-1">
             <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4 leading-none">Captação Elite</h2>
             <p className="text-[10px] text-brand-pink font-bold uppercase tracking-[0.4em] italic">LINEAR DESIGN SYSTEM — SECURE DATA</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white bg-[#1E1E24] border border-[#363645] p-4 rounded-luxury transition-all shadow-xl active:scale-95 group">
            <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 space-y-12">
          
          {/* SERVICE SELECTION */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <Briefcase size={16} className="text-brand-purple" />
               <label className="text-[11px] font-black text-white uppercase tracking-widest italic">Seleção de Ativo Estratégico</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <button 
                  key={p.name} 
                  type="button"
                  onClick={() => handleProductChange(p.name)}
                  className={`p-6 rounded-luxury border text-left flex flex-col gap-4 transition-all group relative overflow-hidden ${formData.product_type === p.name ? 'bg-linear-luxury border-transparent shadow-xl shadow-brand-purple/20' : 'bg-[#1E1E24] border-[#363645] hover:border-brand-purple'}`}
                >
                  <p className={`text-[9px] font-black uppercase tracking-widest leading-tight ${formData.product_type === p.name ? 'text-white/80' : 'text-zinc-500'}`}>{p.name}</p>
                  <h4 className={`text-xl font-black italic tracking-tighter ${formData.product_type === p.name ? 'text-white' : 'text-white font-black'}`}>R$ {p.price.toLocaleString('pt-BR')}</h4>
                  {formData.product_type === p.name && <CheckCircle2 size={16} className="absolute top-4 right-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* NAME */}
            <div className="space-y-4">
               <label className="text-[11px] font-black text-white uppercase tracking-widest italic flex items-center gap-3"><User size={16} className="text-brand-purple" /> Designer ID Name</label>
               <input type="text" required placeholder="NOME DO LEAD" className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-luxury text-white font-bold text-sm outline-none focus:border-brand-purple transition-all placeholder:text-zinc-800 uppercase" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            {/* TEMPERATURE */}
            <div className="space-y-4">
               <label className="text-[11px] font-black text-white uppercase tracking-widest italic flex items-center gap-3"><Flame size={16} className="text-brand-pink" /> Temperatura do Lead</label>
               <div className="flex bg-[#1E1E24] border border-[#363645] rounded-luxury overflow-hidden p-1">
                 {['frio', 'morno', 'quente'].map(temp => (
                   <button 
                     key={temp} type="button" 
                     onClick={() => setFormData({...formData, temperature: temp})}
                     className={`flex-1 py-4 rounded-luxury text-[10px] font-black uppercase tracking-widest transition-all ${formData.temperature === temp ? 'bg-linear-luxury text-white shadow-lg shadow-brand-purple/20' : 'text-zinc-500 hover:text-white'}`}
                   >
                     {temp}
                   </button>
                 ))}
               </div>
            </div>

            {/* CONTACT */}
            <div className="space-y-4">
               <label className="text-[11px] font-black text-white uppercase tracking-widest italic flex items-center gap-3"><Phone size={16} className="text-brand-purple" /> Linha Direta (Whatsapp)</label>
               <input type="text" required placeholder="+55 (00) 00000-0000" className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-luxury text-white font-bold text-sm outline-none focus:border-brand-purple transition-all placeholder:text-zinc-800" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />
            </div>

            {/* COMMISSION CARD */}
            <div className="bg-[#1E1E24] border border-[#363645] p-8 rounded-luxury flex items-center justify-between shadow-inner">
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">Comissão Potencial (30%)</p>
                  <h4 className="text-3xl font-black text-[#10B981] tracking-tighter italic">R$ {commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
               </div>
               <div className="p-4 bg-[#2A2A35] rounded-luxury border border-[#363645]">
                  <Percent size={20} className="text-[#10B981]" />
               </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#363645] flex flex-col md:flex-row gap-6">
             <button type="button" onClick={onClose} className="flex-1 py-6 bg-[#1E1E24] border border-[#363645] rounded-luxury text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all active:scale-95">Descartar Operação</button>
             <button type="submit" className="flex-[2] bg-linear-luxury text-white py-6 rounded-luxury font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-xl active:scale-95 shadow-brand-purple/20 flex items-center justify-center gap-4">
                <span>Finalizar Cadastro Elite</span>
                <ChevronRight size={18} />
             </button>
          </div>
        </form>

        <div className="p-8 border-t border-[#363645] bg-[#1E1E24]/30 flex justify-center">
           <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-[1em]">UNICO HQ COMMAND — PROTECTED ACCESS</p>
        </div>
      </div>
    </div>
  )
}
