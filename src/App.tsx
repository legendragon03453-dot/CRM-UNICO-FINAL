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
    <div className="flex min-h-screen bg-black text-white font-outfit selection:bg-purple-500/30">
      {/* Sidebar - Fixed */}
      <aside className="w-64 fixed left-0 top-0 h-screen border-r border-zinc-800 bg-black/50 backdrop-blur-xl flex flex-col p-6 z-50">
        <div className="mb-12 px-2">
          <h1 className="text-4xl font-black tracking-tighter leading-none mb-1 text-white">UNICO</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-light">Designer Studio CRM</p>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                location.pathname === item.path 
                ? 'bg-zinc-900/50 text-white border border-zinc-800 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-900/30'
              }`}
            >
              <span className={`transition-colors duration-300 ${location.pathname === item.path ? 'text-purple-400' : 'group-hover:text-purple-400'}`}>
                {item.icon}
              </span>
              <span className="text-xs uppercase font-bold tracking-widest">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-zinc-900 space-y-6">
          <div className="px-4 py-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/50">
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-2">Operador Elite</p>
            <p className="text-sm font-black tracking-tight text-white">{profile?.full_name || 'Usuário UNICO'}</p>
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-1">{profile?.role || 'Acessando...'}</p>
          </div>
          <button 
            onClick={onSignOut}
            className="flex items-center gap-4 px-4 py-3 w-full text-zinc-500 hover:text-red-400 transition-all duration-300 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs uppercase font-bold tracking-widest">Sair do Ecossistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Shifted by Sidebar width */}
      <main className="flex-1 ml-64 p-12 overflow-x-hidden">
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
    { label: 'Oportunidades Elite', value: leads.filter(l => (l.ai_score || 0) > 80).length, icon: <UserCheck size={18} />, color: 'purple', trend: '+8.1%' },
  ]

  if (loading) return <div className="text-zinc-500 flex items-center justify-center h-[calc(100vh-6rem)] font-black tracking-[0.5em] uppercase text-xs">Sincronizando Ecossistema...</div>

  return (
    <div className="space-y-12 max-w-7xl">
      <div>
        <h2 className="text-6xl font-black tracking-tighter mb-2 text-white">Dashboard</h2>
        <p className="text-xs text-zinc-500 uppercase tracking-[0.4em] font-light">Visão analítica de alta fidelidade ÚNICO.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`glass p-8 rounded-3xl flex flex-col gap-4 animate-fade-in-up hover:border-zinc-700 transition-all duration-500 group`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`p-4 rounded-2xl bg-zinc-950 border border-zinc-800 transition-all duration-300 ${stat.color === 'green' ? 'text-green-400 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'text-purple-400 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]'}`}>
                {stat.icon}
              </span>
              <span className="text-[10px] font-black text-green-400 uppercase tracking-widest bg-green-400/5 px-3 py-1 rounded-full border border-green-500/10">
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-4xl font-black tracking-tighter text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 glass p-10 rounded-[32px] animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-black tracking-widest uppercase text-white">Volume por Status</h3>
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
          </div>
          <div className="space-y-8">
            {['iniciou_atendimento', 'conversando', 'agendamento', 'follow_up'].map(status => (
              <div key={status} className="space-y-3">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-zinc-500">{status.replace('_', ' ')}</span>
                  <span className="text-white">{leads.filter(l => l.status === status).length}</span>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800/50">
                  <div 
                    className="bg-purple-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                    style={{ width: `${(leads.filter(l => l.status === status).length / (leads.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-2 glass p-10 rounded-[32px] animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-black tracking-widest uppercase text-white">Atividades Recentes</h3>
            <button className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">Visualizar Tudo</button>
          </div>
          <div className="space-y-2">
            {leads.slice(0, 5).map(lead => (
              <div key={lead.id} className="flex items-center gap-6 p-5 hover:bg-zinc-900/30 rounded-2xl transition-all duration-300 cursor-pointer group border border-transparent hover:border-zinc-800">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center text-white font-black text-sm group-hover:scale-105 group-hover:border-purple-500/50 transition-all">
                  {lead.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold tracking-tight group-hover:text-purple-400 transition-colors text-white">{lead.name}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium mt-1">Ingresso: {new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase py-2 px-4 bg-zinc-950 text-purple-400 rounded-lg border border-zinc-800 group-hover:border-purple-500/30 transition-all tracking-widest">
                    {lead.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {leads.length === 0 && <p className="text-center py-12 text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black">Nenhum dado capturado ainda.</p>}
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

  if (loading) return <div className="text-zinc-500 flex items-center justify-center h-[calc(100vh-6rem)] font-black tracking-[0.5em] uppercase text-xs">Capturando Oportunidades...</div>

  return (
    <div className="space-y-12 max-w-7xl animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-6xl font-black tracking-tighter mb-2 text-white">Leads</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-[0.4em] font-light">Controle de leads de alta fidelidade ÚNICO.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-purple-400 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 flex items-center gap-3"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Cadastrar Lead</span>
        </button>
      </div>

      <div className="glass rounded-[32px] overflow-hidden">
        <div className="p-8 border-b border-zinc-800/50 flex flex-col md:flex-row gap-6 bg-zinc-950/20">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input 
              placeholder="PESQUISAR NO ECOSSISTEMA..." 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-bold text-white tracking-widest focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-800"
            />
          </div>
          <button className="flex items-center gap-3 px-8 py-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-zinc-500 hover:text-white transition-all group">
            <Filter size={16} className="group-hover:rotate-180 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Filtros</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-950 text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black border-b border-zinc-900">
              <tr>
                <th className="px-10 py-6">Designer Lead</th>
                <th className="px-10 py-6">Canais</th>
                <th className="px-10 py-6 text-center">IA Score</th>
                <th className="px-10 py-6">Budget</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Opções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-900/20 transition-all duration-300 group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xs font-black group-hover:border-purple-500/50 group-hover:text-purple-400 transition-all text-white">
                        {lead.name[0]}
                      </div>
                      <div>
                        <p className="text-base font-bold tracking-tight text-white">{lead.name}</p>
                        <p className="text-[9px] text-zinc-600 font-black tracking-widest mt-1 uppercase">ESTRATÉGICO</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 group/icon cursor-pointer">
                         <Globe size={14} className="text-purple-400 opacity-60 group-hover/icon:opacity-100 transition-opacity" />
                         <span className="text-xs text-zinc-500 font-medium group-hover/icon:text-white transition-colors">{lead.instagram || 'None'}</span>
                       </div>
                       <div className="flex items-center gap-2 group/icon cursor-pointer">
                         <Smartphone size={14} className="text-purple-400 opacity-60 group-hover/icon:opacity-100 transition-opacity" />
                         <span className="text-xs text-zinc-500 font-medium group-hover/icon:text-white transition-colors text-nowrap">{lead.whatsapp || 'None'}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`text-[10px] font-black py-1.5 px-3 rounded-lg border tracking-widest ${
                      (lead.ai_score || 0) > 80 
                      ? 'border-green-500/30 bg-green-500/5 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                      : 'border-zinc-800 bg-zinc-950 text-zinc-500'
                    }`}>
                      {lead.ai_score || '??'}%
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-black tracking-tight text-white">{lead.faturamento_estimado ? `R$ ${lead.faturamento_estimado.toLocaleString()}` : 'R$ 0'}</p>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[9px] font-black uppercase py-2 px-5 bg-zinc-950 text-purple-400 rounded-full border border-zinc-800 group-hover:border-purple-500/30 transition-all tracking-widest">
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="text-zinc-800 hover:text-white p-3 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all">
                      <Settings size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <div className="p-24 text-center">
              <div className="w-16 h-16 bg-zinc-950 rounded-full border border-dashed border-zinc-800 flex items-center justify-center mx-auto mb-6">
                <Users size={24} className="text-zinc-800" />
              </div>
              <p className="text-[11px] text-zinc-700 font-black uppercase tracking-[0.4em]">Seu pipeline estratégico está livre de leads.</p>
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
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center z-[100] animate-in fade-in duration-500">
          <div className="text-center space-y-10 max-w-sm px-10">
            <div className="relative inline-block">
              <div className="w-24 h-24 border border-zinc-900 rounded-full"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-t border-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={32} className="text-purple-400 animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] text-purple-400 font-black uppercase tracking-[0.5em] animate-pulse">Classificação Elite</p>
              <h3 className="text-2xl font-black tracking-tighter text-white">IA processando viabilidade estrategica...</h3>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">Qualificando autoridade e ticket para o ecossistema UNICO.</p>
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
    { id: 'iniciou_atendimento', label: 'Estratégia', color: '#A855F7' },
    { id: 'conversando', label: 'Negociação', color: '#A855F7' },
    { id: 'agendamento', label: 'Briefing', color: '#A855F7' },
    { id: 'follow_up', label: 'Follow-up', color: '#A855F7' },
    { id: 'compareceu', label: 'Contrato', color: '#22C55E' },
  ]

  if (loading) return <div className="text-zinc-500 flex items-center justify-center h-[calc(100vh-6rem)] font-black tracking-[0.5em] uppercase text-xs">Ajustando Visão Pipeline...</div>

  return (
    <div className="h-full flex flex-col gap-12 animate-fade-in-up">
      <div>
        <h2 className="text-6xl font-black tracking-tighter mb-2 text-white">Pipeline</h2>
        <p className="text-xs text-zinc-500 uppercase tracking-[0.4em] font-light">Evolução estratégica no ecossistema ÚNICO.</p>
      </div>

      <div className="flex-1 flex gap-10 overflow-x-auto pb-10 custom-scrollbar">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-[350px] flex flex-col gap-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-1 h-10 rounded-full" 
                  style={{ backgroundColor: column.color, boxShadow: `0 0 15px ${column.color}30` }}
                ></div>
                <div>
                  <h3 className="font-black text-white uppercase text-[11px] tracking-[0.2em]">{column.label}</h3>
                  <p className="text-[10px] text-zinc-600 font-black tracking-widest mt-0.5 whitespace-nowrap">
                    {leads.filter(l => l.status === column.id).length} OPORTUNIDADES
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-zinc-950/20 glass rounded-[40px] p-6 space-y-6 min-h-[600px]">
              {leads.filter(l => l.status === column.id).map(lead => (
                <div 
                  key={lead.id} 
                  className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[32px] hover:border-purple-500/30 hover:bg-zinc-900/60 transition-all duration-500 cursor-grab active:cursor-grabbing group shadow-2xl relative overflow-hidden"
                >
                  {/* Subtle AI Glow */}
                  {(lead.ai_score || 0) > 80 && (
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/5 blur-[40px] rounded-full"></div>
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-lg font-black text-white tracking-tighter group-hover:text-purple-400 transition-colors uppercase">{lead.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {lead.ai_tags?.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-[8px] font-black uppercase py-1 px-3 bg-zinc-950 text-zinc-500 rounded-full border border-zinc-800 group-hover:border-purple-500/20 transition-all tracking-widest">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black py-1.5 px-3 rounded-lg border tracking-widest ${
                        (lead.ai_score || 0) > 80 ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-zinc-800 text-zinc-600 bg-zinc-950'
                      }`}>
                        {lead.ai_score || '??'}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <p className="text-xs text-zinc-500 flex items-center gap-3 font-medium transition-colors hover:text-white">
                      <Globe size={14} className="text-purple-400 opacity-60" /> {lead.instagram || 'None'}
                    </p>
                    <p className="text-[13px] text-white font-black tracking-tight flex items-center gap-3">
                      <DollarSign size={14} className="text-green-500 opacity-60" /> R$ {lead.faturamento_estimado?.toLocaleString() || '0'}
                    </p>
                  </div>

                  <div className="relative group/select">
                    <select 
                      className="w-full bg-zinc-950 border border-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 rounded-2xl px-6 py-4 focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer hover:text-white"
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    >
                      {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-800 group-hover/select:text-purple-400 transition-colors">
                      <TrendingUp size={12} />
                    </div>
                  </div>
                </div>
              ))}
              {leads.filter(l => l.status === column.id).length === 0 && (
                <div className="h-40 border border-dashed border-zinc-900 rounded-[32px] flex items-center justify-center bg-zinc-950/20">
                  <p className="text-[10px] text-zinc-800 font-black uppercase tracking-[0.4em]">Limpo</p>
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
