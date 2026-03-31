import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Columns, MessageSquare, Calendar, Settings, LogOut, Plus, Search, Filter, TrendingUp, DollarSign, UserCheck, Globe, Smartphone, Sparkles } from 'lucide-react'
import { useLeads } from './hooks/useLeads'
import { AddLeadModal } from './components/AddLeadModal'
import { analyzeLead } from './lib/gemini'
import { useAuth } from './hooks/useAuth'
import { Login } from './components/Login'

// Layout Component
const Layout = ({ children, profile, onSignOut }: { children: React.ReactNode, profile: any, onSignOut: () => void }) => {
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/' },
    { icon: <Users size={18} />, label: 'Leads', path: '/leads' },
    { icon: <Columns size={18} />, label: 'Kanban', path: '/kanban' },
    { icon: <MessageSquare size={18} />, label: 'Follow-up', path: '/follow-up' },
    { icon: <Calendar size={18} />, label: 'Agendamentos', path: '/appointments' },
    { icon: <Settings size={18} />, label: 'Configurações', path: '/settings' },
  ]

  return (
    <div className="flex w-full h-screen bg-[#000000]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 bg-[#000000] relative">
        <div className="mb-12 px-2">
          <h1 className="text-4xl font-extrabold text-[#FFFFFF] tracking-tighter leading-none mb-1">UNICO</h1>
          <p className="text-[10px] text-[#888888] uppercase tracking-[0.3em] font-light">Designer Studio CRM</p>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-300 ${
                location.pathname === item.path 
                ? 'glass text-[#FFFFFF] glow-purple' 
                : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-white/5'
              }`}
            >
              <span className={location.pathname === item.path ? 'text-[#D8B4FE]' : ''}>{item.icon}</span>
              <span className="text-xs uppercase font-bold tracking-widest">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
          <div className="px-4 py-4 glass rounded-lg border-white/5">
            <p className="text-[9px] text-[#888888] uppercase font-bold tracking-[0.2em] mb-2">Operador Ativo</p>
            <p className="text-sm font-extrabold text-[#FFFFFF] tracking-tight">{profile?.full_name || 'Usuário UNICO'}</p>
            <p className="text-[10px] text-[#D8B4FE] font-bold uppercase tracking-widest mt-1">{profile?.role || 'Acessando...'}</p>
          </div>
          <button 
            onClick={onSignOut}
            className="flex items-center gap-4 px-4 py-3 w-full text-[#888888] hover:text-[#EF4444] transition-all duration-300 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs uppercase font-bold tracking-widest">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-12 bg-[#000000]">
        {children}
      </main>
    </div>
  )
}

// Page Components
const Dashboard = () => {
  const { leads, loading } = useLeads()
  
  const stats = [
    { label: 'Total de Leads', value: leads.length, icon: <Users size={18} />, color: 'purple', trend: '+12.5%' },
    { label: 'Ativos agora', value: leads.filter(l => l.status === 'conversando').length, icon: <TrendingUp size={18} />, color: 'green', trend: '+3.2%' },
    { label: 'Faturamento Potencial', value: `R$ ${leads.reduce((acc, curr) => acc + (curr.faturamento_estimado || 0), 0).toLocaleString()}`, icon: <DollarSign size={18} />, color: 'green', trend: '+45.0%' },
    { label: 'Oportunidades', value: leads.filter(l => (l.ai_score || 0) > 80).length, icon: <UserCheck size={18} />, color: 'purple', trend: '+8.1%' },
  ]

  if (loading) return <div className="text-white flex items-center justify-center h-full font-bold tracking-widest uppercase">Carregando Ecossistema...</div>

  return (
    <div className="space-y-12 max-w-7xl">
      <div>
        <h2 className="text-5xl font-black text-[#FFFFFF] tracking-tighter mb-2">Dashboard UNICO</h2>
        <p className="text-xs text-[#888888] uppercase tracking-[0.4em] font-light">Visão analítica de alta fidelidade.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`glass p-8 rounded-2xl flex flex-col gap-4 glow-${stat.color} glass-hover animate-fade-in-up`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`p-4 rounded-xl bg-white/5 border border-white/5 ${stat.color === 'green' ? 'text-[#22C55E]' : 'text-[#D8B4FE]'}`}>
                {stat.icon}
              </span>
              <span className="text-[10px] font-black text-[#22C55E] uppercase tracking-widest bg-[#22C55E]/10 px-3 py-1 rounded-full border border-[#22C55E]/20">
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-4xl font-black text-[#FFFFFF] tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 glass p-10 rounded-2xl animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-black text-[#FFFFFF] tracking-widest uppercase">Volume por Status</h3>
            <div className="w-2 h-2 rounded-full bg-[#D8B4FE] glow-purple shadow-purple-500/50"></div>
          </div>
          <div className="space-y-8">
            {['iniciou_atendimento', 'conversando', 'agendamento', 'follow_up'].map(status => (
              <div key={status} className="space-y-3">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-[#888888]">{status.replace('_', ' ')}</span>
                  <span className="text-[#FFFFFF]">{leads.filter(l => l.status === status).length}</span>
                </div>
                <div className="w-full bg-white/5 h-[6px] rounded-full overflow-hidden">
                  <div 
                    className="bg-[#D8B4FE] h-full rounded-full transition-all duration-1000 ease-out glow-purple" 
                    style={{ width: `${(leads.filter(l => l.status === status).length / (leads.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-2 glass p-10 rounded-2xl animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-black text-[#FFFFFF] tracking-widest uppercase">Últimas Atividades Elite</h3>
            <button className="text-[10px] font-bold text-[#888888] hover:text-[#FFFFFF] uppercase tracking-widest transition-colors">Ver todos</button>
          </div>
          <div className="space-y-2">
            {leads.slice(0, 5).map(lead => (
              <div key={lead.id} className="flex items-center gap-6 p-5 hover:bg-white/5 rounded-xl transition-all duration-300 cursor-pointer group border border-transparent hover:border-white/5">
                <div className="w-12 h-12 glass border-white/10 rounded-full flex items-center justify-center text-[#FFFFFF] font-black text-sm group-hover:scale-110 transition-transform">
                  {lead.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-[#FFFFFF] tracking-tight group-hover:text-[#D8B4FE] transition-colors">{lead.name}</p>
                  <p className="text-[10px] text-[#888888] uppercase tracking-widest font-medium mt-1">Entrou em {new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase py-2 px-4 bg-white/5 text-[#D8B4FE] rounded-lg border border-white/5 group-hover:border-[#D8B4FE]/30 transition-all">
                    {lead.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {leads.length === 0 && <p className="text-center py-10 text-xs text-[#888888] uppercase tracking-widest">Sem atividades registradas.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

const Leads = () => {
  const { leads, loading, addLead } = useLeads()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAddLead = async (leadData: any) => {
    setIsAnalyzing(true)
    try {
      // 1. Get AI Analysis from Gemini
      const analysis = await analyzeLead(leadData)
      
      // 2. Add lead with AI data
      await addLead({
        ...leadData,
        ai_score: analysis.score_potencial,
        ai_tags: analysis.tags_ai,
        ai_summary: analysis.ai_summary
      })
    } catch (err) {
      console.error('AI Processing Failed:', err)
      await addLead(leadData)
    } finally {
      setIsAnalyzing(false)
      setIsModalOpen(false)
    }
  }

  if (loading) return <div className="text-white flex items-center justify-center h-full font-bold tracking-widest uppercase">Prospectando Leads...</div>

  return (
    <div className="space-y-12 max-w-7xl animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-[#FFFFFF] tracking-tighter mb-2">Gestão de Leads</h2>
          <p className="text-xs text-[#888888] uppercase tracking-[0.4em] font-light">Controle de leads de alta performance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#D8B4FE] hover:scale-105 transition-all duration-300 shadow-xl shadow-white/5 active:scale-95"
        >
          <div className="flex items-center gap-2">
            <Plus size={16} strokeWidth={3} />
            <span>Novo Lead Premium</span>
          </div>
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden border-white/5">
        <div className="p-8 border-b border-white/5 flex gap-6 bg-white/[0.02]">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input 
              placeholder="BUSCAR LEADS..." 
              className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-6 py-4 text-[10px] font-bold text-[#FFFFFF] tracking-widest focus:outline-none focus:border-[#D8B4FE]/50 transition-all placeholder:text-[#333]"
            />
          </div>
          <button className="flex items-center gap-3 px-8 py-4 glass border-white/10 rounded-xl text-[#888888] hover:text-[#FFFFFF] transition-all group">
            <Filter size={16} className="group-hover:rotate-180 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Filtros Avançados</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#000000] text-[#888888] text-[10px] uppercase tracking-[0.25em] font-black">
              <tr>
                <th className="px-10 py-6 border-b border-white/5">Lead Designer</th>
                <th className="px-10 py-6 border-b border-white/5">Canais de Contato</th>
                <th className="px-10 py-6 border-b border-white/5">Budget Est.</th>
                <th className="px-10 py-6 border-b border-white/5">Timeline</th>
                <th className="px-10 py-6 border-b border-white/5">Status Pipeline</th>
                <th className="px-10 py-6 border-b border-white/5 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.03] transition-all duration-300 group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-full glass border-white/10 flex items-center justify-center text-xs font-black group-hover:border-[#D8B4FE]/50 group-hover:text-[#D8B4FE] transition-all">
                        {lead.name[0]}
                      </div>
                      <div>
                        <p className="text-base font-extrabold text-[#FFFFFF] tracking-tight">{lead.name}</p>
                        <p className="text-[9px] text-[#333] font-black tracking-widest mt-1 uppercase">UI/UX PROJECTS</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-2">
                      <p className="text-xs text-[#888888] flex items-center gap-3 font-medium hover:text-[#FFFFFF] transition-colors"><Globe size={14} className="text-[#D8B4FE] opacity-70" /> {lead.instagram || 'NONE'}</p>
                      <p className="text-xs text-[#888888] flex items-center gap-3 font-medium hover:text-[#FFFFFF] transition-colors"><Smartphone size={14} className="text-[#D8B4FE] opacity-70" /> {lead.whatsapp || 'NONE'}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-black text-[#FFFFFF] tracking-tight">{lead.faturamento_estimado ? `R$ ${lead.faturamento_estimado.toLocaleString()}` : 'R$ 0'}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                      <p className="text-xs text-[#FFFFFF] font-bold tracking-tight">{lead.dia || 'Pendente'}</p>
                      <p className="text-[10px] text-[#888888] uppercase tracking-widest font-black">{lead.horario || 'Waiting'}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[9px] font-black uppercase py-2 px-5 bg-white/5 text-[#D8B4FE] rounded-full border border-white/5 group-hover:border-[#D8B4FE]/30 transition-all">
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="text-[#333] hover:text-[#FFFFFF] p-3 rounded-xl glass border-transparent hover:border-white/10 transition-all">
                      <Settings size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <div className="p-24 text-center">
              <div className="w-16 h-16 glass rounded-full border-dashed border-white/10 flex items-center justify-center mx-auto mb-6">
                <Users size={24} className="text-[#333]" />
              </div>
              <p className="text-[11px] text-[#333] font-black uppercase tracking-[0.4em]">Seu pipeline de design está pronto para ser preenchido.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <AddLeadModal 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddLead} 
        />
      )}
      
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-[100] animate-in fade-in duration-500">
          <div className="text-center space-y-8 max-w-sm px-10">
            <div className="relative">
              <div className="w-24 h-24 border-2 border-white/5 rounded-full mx-auto"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#D8B4FE] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={32} className="text-[#D8B4FE] animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] text-[#D8B4FE] font-black uppercase tracking-[0.5em] animate-pulse">Inteligência Artificial</p>
              <h3 className="text-2xl font-black text-[#FFFFFF] tracking-tighter">Gemini 3 analisando pipeline estratégico...</h3>
              <p className="text-xs text-[#888888] font-light leading-relaxed">Aguarde enquanto nossa rede neural qualifica a oportunidade de design.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
const Kanban = () => {
  const { leads, loading, updateLeadStatus } = useLeads()
  
  const columns = [
    { id: 'iniciou_atendimento', label: 'Estratégia', color: '#D8B4FE' },
    { id: 'conversando', label: 'Negociação', color: '#D8B4FE' },
    { id: 'agendamento', label: 'Briefing', color: '#D8B4FE' },
    { id: 'follow_up', label: 'Follow-up', color: '#D8B4FE' },
    { id: 'compareceu', label: 'Contrato', color: '#22C55E' },
  ]

  if (loading) return <div className="text-white flex items-center justify-center h-full font-bold tracking-widest uppercase text-xs">Ajustando Visão Pipeline...</div>

  return (
    <div className="h-full flex flex-col gap-12 animate-fade-in-up">
      <div>
        <h2 className="text-5xl font-black text-[#FFFFFF] tracking-tighter mb-2">Pipeline UNICO</h2>
        <p className="text-xs text-[#888888] uppercase tracking-[0.4em] font-light">Evolução de alta fidelidade dos leads design.</p>
      </div>

      <div className="flex-1 flex gap-10 overflow-x-auto pb-10 custom-scrollbar">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-[350px] flex flex-col gap-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-1.5 h-10 rounded-full" 
                  style={{ backgroundColor: column.color, boxShadow: `0 0 15px ${column.color}` }}
                ></div>
                <div>
                  <h3 className="font-black text-[#FFFFFF] uppercase text-[11px] tracking-[0.2em]">{column.label}</h3>
                  <p className="text-[10px] text-[#333] font-black tracking-widest mt-0.5">
                    {leads.filter(l => l.status === column.id).length} OPORTUNIDADES
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 glass rounded-3xl p-6 space-y-6 min-h-[600px] border-white/5 bg-white/[0.01]">
              {leads.filter(l => l.status === column.id).map(lead => (
                <div 
                  key={lead.id} 
                  className="glass p-8 rounded-2xl border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 cursor-grab active:cursor-grabbing group shadow-2xl relative overflow-hidden"
                >
                  {/* Subtle background glow for high score */}
                  {(lead.ai_score || 0) > 80 && (
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#D8B4FE]/5 blur-[40px] rounded-full"></div>
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-lg font-black text-[#FFFFFF] tracking-tighter group-hover:text-[#D8B4FE] transition-colors">{lead.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {lead.ai_tags?.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-[8px] font-black uppercase py-1 px-3 bg-white/5 text-[#888888] rounded-full border border-white/5 group-hover:border-white/10 transition-all tracking-[0.1em]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-black py-1 px-3 rounded-full border ${
                        (lead.ai_score || 0) > 80 
                        ? 'border-[#22C55E]/30 bg-[#22C55E]/5 text-[#22C55E]' 
                        : 'border-white/10 bg-white/5 text-[#888888]'
                      }`}>
                        {lead.ai_score || '?'}/100
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <p className="text-xs text-[#888888] flex items-center gap-3 font-medium transition-colors hover:text-[#FFFFFF]">
                      <Globe size={14} className="text-[#D8B4FE] opacity-60" /> {lead.instagram || 'None'}
                    </p>
                    <p className="text-[13px] text-[#FFFFFF] font-extrabold tracking-tight flex items-center gap-3">
                      <DollarSign size={14} className="text-[#22C55E] opacity-60" /> R$ {lead.faturamento_estimado?.toLocaleString() || '0'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 relative group/select">
                      <select 
                        className="w-full bg-[#000000] border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-[#888888] rounded-xl px-5 py-4 focus:outline-none focus:border-[#D8B4FE]/50 transition-all appearance-none cursor-pointer hover:text-[#FFFFFF]"
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      >
                        {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#333] group-hover/select:text-[#D8B4FE] transition-colors">
                        <TrendingUp size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {leads.filter(l => l.status === column.id).length === 0 && (
                <div className="h-40 border border-dashed border-white/5 rounded-3xl flex items-center justify-center bg-white/[0.01]">
                  <p className="text-[10px] text-[#222] font-black uppercase tracking-[0.4em]">Empty Pipeline</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
const FollowUp = () => <div className="text-[#F5F5F5]"><h2>Follow-up</h2></div>
const Appointments = () => <div className="text-[#F5F5F5]"><h2>Agendamentos</h2></div>
const Config = () => <div className="text-[#F5F5F5]"><h2>Configurações</h2></div>

function App() {
  const { user, profile, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-white/5 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-[#D8B4FE] rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Router>
      <Layout profile={profile} onSignOut={signOut}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/follow-up" element={<FollowUp />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/settings" element={<Config />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
