import React, { useState } from 'react'
import { X, User, Globe, Smartphone, DollarSign, Calendar, Clock } from 'lucide-react'

interface AddLeadModalProps {
  onClose: () => void
  onAdd: (lead: any) => Promise<void>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onAdd({
      ...formData,
      faturamento_estimado: parseFloat(formData.faturamento_estimado) || 0
    })
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] border border-[#262626] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[#262626]">
          <h3 className="text-xl font-bold text-[#F5F5F5]">Novo Lead Elite</h3>
          <button onClick={onClose} className="text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">Nome Completo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]"><User size={16} /></span>
                <input 
                  type="text" name="name" required
                  placeholder="Nome do cliente"
                  className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg pl-10 pr-3 py-2 text-[#F5F5F5] focus:outline-none focus:border-[#1E3A8A] transition-colors"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">Instagram</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]"><Globe size={16} /></span>
                <input 
                  type="text" name="instagram"
                  placeholder="@usuario"
                  className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg pl-10 pr-3 py-2 text-[#F5F5F5] focus:outline-none focus:border-[#1E3A8A] transition-colors"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">WhatsApp</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]"><Smartphone size={16} /></span>
                <input 
                  type="text" name="whatsapp"
                  placeholder="55..."
                  className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg pl-10 pr-3 py-2 text-[#F5F5F5] focus:outline-none focus:border-[#1E3A8A] transition-colors"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">Faturamento Est.</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]"><DollarSign size={16} /></span>
                <input 
                  type="number" name="faturamento_estimado"
                  placeholder="Valor mensal"
                  className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg pl-10 pr-3 py-2 text-[#F5F5F5] focus:outline-none focus:border-[#1E3A8A] transition-colors"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">Dia</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]"><Calendar size={16} /></span>
                <input 
                  type="date" name="dia"
                  className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg pl-10 pr-3 py-2 text-[#F5F5F5] focus:outline-none focus:border-[#1E3A8A] transition-colors"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">Horário</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]"><Clock size={16} /></span>
                <input 
                  type="time" name="horario"
                  className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg pl-10 pr-3 py-2 text-[#F5F5F5] focus:outline-none focus:border-[#1E3A8A] transition-colors"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-bold hover:bg-[#2563EB] transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-900/20"
          >
            Cadastrar Lead Premium
          </button>
        </form>
      </div>
    </div>
  )
}
