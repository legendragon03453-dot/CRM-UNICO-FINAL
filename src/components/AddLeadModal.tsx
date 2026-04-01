import React, { useState, useEffect } from 'react'
import { X, User, Globe, Phone, DollarSign, Calendar, Clock, Sparkles, UserCheck, Flame, Briefcase, Percent } from 'lucide-react'

interface AddLeadModalProps {
  onClose: () => void
  onAdd: (lead: any) => void
  profile?: any
}

export const AddLeadModal = ({ onClose, onAdd, profile }: AddLeadModalProps) => {
  const products = [
    { name: 'Produto 1: Identidade Visual + Estratégia de conteúdo', price: 15000 },
    { name: 'Produto 2: Identidade Visual', price: 7000 },
    { name: 'Produto 3: Site', price: 5000 },
    { name: 'Mentoria de Criação de Conteúdo', price: 3000 },
    { name: 'Produto 4: Mentoria de Site com IA [Em Grupo]', price: 500 },
    { name: 'Produto 5: Cursos e Afins', price: 197 }
  ]

  const [formData, setFormData] = useState({
    name: '',
    instagram: '',
    whatsapp: '',
    faturamento_estimado: String(products[2].price), // Default to Site (5k)
    dia: '',
    horario: '',
    status: 'iniciou_atendimento',
    temperature: 'frio',
    product_type: products[2].name
  })

  const [showCommission, setShowCommission] = useState(true)

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
    <div className="fixed inset-0 bg-[#000000]/98 backdrop-blur-3xl flex items-center justify-center p-4 z-[200] animate-in fade-in duration-500 overflow-y-auto font-outfit">
      <div className="w-full max-w-5xl bg-[#1C1B16] border border-[#2A2922] rounded-none shadow-[0_60px_150px_rgba(0,0,0,1)] relative flex flex-col max-h-[95vh] h-full sm:h-auto my-auto overflow-hidden">
        
        {/* COMMISSION POPUP / SIDE BAR (ONLY ON VERY LARGE SCREENS) */}
        {Number(formData.faturamento_estimado) > 0 && (
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 translate-x-full hidden 2xl:flex flex-col gap-4 animate-in slide-in-from-left-8 duration-500">
             <div className="bg-white p-8 border-l-8 border-zinc-300 shadow-2xl flex flex-col gap-4 min-w-[280px]">
                <div className="flex items-center gap-3"><Percent size={14} className="text-black" /><p className="text-[10px] font-black tracking-widest text-black uppercase italic">Comissão (30%)</p></div>
                <h4 className="text-4xl font-black text-black tracking-tighter italic">R$ {commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-tight">Valor referente ao ticket selecionado: {formData.product_type}</p>
             </div>
          </div>
        )}

        <div className="absolute top-0 left-0 w-full h-1 bg-white/5"></div>
        <div className="p-8 md:p-16 pb-6 md:pb-10 flex justify-between items-start shrink-0">
          <div className="space-y-4">
             <h2 className="text-sm font-black text-white tracking-[0.6em] uppercase flex items-center gap-4 italic"><div className="w-2 h-2 bg-white animate-pulse"></div>Captação Elite Linear</h2>
             <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xs">Inserindo novos dados estratégicos no ecossistema UNICO Studio.</p>
          </div>
          <button onClick={onClose} className="text-zinc-700 hover:text-white border border-[#2A2922] p-4 md:p-6 hover:bg-white/5 transition-all outline-none">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-16 pt-0 space-y-12 md:space-y-16 overflow-y-auto flex-1 custom-scrollbar scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 md:gap-x-16 gap-y-10 md:gap-y-12">
            
            <div className="md:col-span-2 space-y-6">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Selecione o Serviço do Studio</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                  <button 
                    key={p.name} 
                    type="button"
                    onClick={() => handleProductChange(p.name)}
                    className={`p-6 border text-left flex flex-col gap-3 transition-all group ${formData.product_type === p.name ? 'bg-white border-white' : 'bg-[#14130E] border-[#2A2922] hover:border-zinc-500'}`}
                  >
                    <p className={`text-[9px] font-black uppercase tracking-widest ${formData.product_type === p.name ? 'text-black' : 'text-zinc-600'}`}>{p.name}</p>
                    <div className="flex items-center justify-between">
                       <h4 className={`text-xl font-black italic tracking-tighter ${formData.product_type === p.name ? 'text-black' : 'text-white'}`}>R$ {p.price.toLocaleString('pt-BR')}</h4>
                       <ChevronRight size={16} className={`transition-all ${formData.product_type === p.name ? 'text-black translate-x-1' : 'text-zinc-800'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Designer ID Name</label>
              <div className="relative group border-b-2 border-[#2A2922] focus-within:border-white transition-all">
                <input type="text" required placeholder="NOME COMPLETO" className="w-full bg-transparent py-5 pl-0 text-xs font-black text-white tracking-[0.3em] focus:outline-none placeholder:text-zinc-800 uppercase" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
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
                <input type="text" required placeholder="+55 (00) 00000-0000" className="w-full bg-transparent py-5 text-xs font-black text-white tracking-[0.3em] focus:outline-none placeholder:text-zinc-800 uppercase" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4 opacity-50">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Valor do Ticket (Preenchido Via Produto)</label>
              <div className="relative border-b-2 border-[#2A2922]">
                <input type="number" readOnly className="w-full bg-transparent py-5 text-xs font-black text-zinc-500 tracking-[0.3em] outline-none cursor-not-allowed" value={formData.faturamento_estimado} />
              </div>
            </div>

            {/* COMMISSION VIEW FOR SMALLER SCREENS */}
            {commission > 0 && (
              <div className="md:col-span-2 2xl:hidden bg-white p-6 border-l-8 border-zinc-300 flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-4 duration-500 mt-4">
                <div>
                   <p className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">Comissão Estimada (30%)</p>
                   <h4 className="text-2xl font-black text-black tracking-tighter italic">R$ {commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                </div>
                <Percent size={24} className="text-black/10" />
              </div>
            )}
          </div>

          <div className="pt-10 md:pt-20 flex flex-col sm:flex-row gap-4 mb-4">
            <button type="button" onClick={onClose} className="flex-1 py-6 md:py-8 border-2 border-[#2A2922] text-[11px] font-black uppercase tracking-[0.5em] text-zinc-600 hover:text-white transition-all">Descartar</button>
            <button type="submit" className="flex-[2] bg-white text-black py-6 md:py-8 font-black text-[11px] uppercase tracking-[0.6em] hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-4">Finalizar Cadastro</button>
          </div>
        </form>

        <div className="p-8 md:p-12 pt-0 flex flex-col items-center gap-4 md:gap-6 border-t border-[#2A2922]/50 shrink-0">
           {profile && (
             <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-4 md:mt-8 border-b border-[#2A2922] pb-1">Operador Studio: {profile.full_name}</p>
           )}
           <p className="text-[9px] text-zinc-800 font-extrabold uppercase tracking-[1em] mb-4">UNICO DESIGN SYSTEM © SECURE DATA</p>
        </div>
      </div>
    </div>
  )
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
