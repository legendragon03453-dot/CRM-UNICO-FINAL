import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Columns, MessageSquare, Calendar, Settings, LogOut, Plus, Search, Filter, TrendingUp, DollarSign, UserCheck, Globe, Smartphone, Sparkles } from 'lucide-react'
import { useLeads } from './hooks/useLeads'
import { AddLeadModal } from './components/AddLeadModal'
import { analyzeLead } from './lib/gemini'
import { supabase } from './lib/supabaseClient'
import { Login } from './components/Login'

// Authentication Guard Component
const AuthGuard = ({ children, session, profile, loading, onSignOut }: any) => {
  if (loading) return <div className="h-screen bg-black flex items-center justify-center font-black uppercase text-xs tracking-[0.5em] text-zinc-800 animate-pulse">Autenticando no Ecossistema...</div>
  if (!session) return <Login />
  return <Layout profile={profile} onSignOut={onSignOut}>{children}</Layout>
}

// Layout Component (Fixed Sidebar Architecture)
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
    <div className="flex min-h-screen bg-black text-white font-outfit selection:bg-purple-500/30 overflow-x-hidden">
      {/* Sidebar - Fixed Left */}
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
                ? 'bg-zinc-900/50 text-white border border-zinc-800 shadow-[0_0_20px_rgba(168,85,247,0.1)]' 
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
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
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-2 font-black">Operador Elite</p>
            <p className="text-sm font-black tracking-tight text-white truncate">{profile?.full_name || 'Agente Studio'}</p>
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-1">Conectado</p>
          </div>
          <button 
            onClick={onSignOut}
            className="flex items-center gap-4 px-4 py-3 w-full text-zinc-500 hover:text-red-400 transition-all duration-300 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs uppercase font-bold tracking-widest">Sair do Studio</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Shifted right by 64 (256px) */}
      <main className="flex-1 ml-64 p-12 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

// Dashboard Page (Structural Correction: 4 Column Grid)
const Dashboard = () => {
  const { leads, loading } = useLeads()
  
  const stats = [
    { label: 'Pipeline Total', value: leads.length, icon: <Users size={18} />, color: 'purple', trend: '+12%' },
    { label: 'Conversas Ativas', value: leads.filter(l => l.status === 'conversando').length, icon: <MessageSquare size={18} />, color: 'purple', trend: '+5%' },
    { label: 'Equity de Projetos', value: `R$ ${leads.reduce((acc, curr) => acc + (curr.faturamento_estimado || 0), 0).toLocaleString()}`, icon: <DollarSign size={18} />, color: 'green', trend: '+28%' },
    { label: 'Match Elite (AI)', value: leads.filter(l => (l.ai_score || 0) > 80).length, icon: <Sparkles size={18} />, color: 'purple', trend: '+8%' },
  ]

  if (loading) return <div className="text-zinc-800 flex items-center justify-center min-h-[50vh] font-black uppercase text-xs tracking-[0.5em]">Sincronizando Ecossistema...</div>

  return (
    <div className="space-y-16 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-7xl font-black tracking-tighter mb-2 text-white">Dashboard</h2>
          <p className="text-xs text-zinc-600 uppercase tracking-[0.5em] font-light">Visão analítica de alta fidelidade UNICO Studio.</p>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-transparent rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)]"></div>
      </div>

      {/* Metrics Grid Overlay */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="glass-no-blur p-10 rounded-[40px] flex flex-col gap-6 relative overflow-hidden group hover:bg-zinc-900 transition-all duration-500 hover:border-zinc-700 animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between relative z-10">
              <span className={`p-4 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${stat.color === 'green' ? 'text-green-400' : 'text-purple-400'} group-hover:scale-110 transition-transform duration-500`}>
                {stat.icon}
              </span>
              <span className={`text-[10px] font-black bg-white/5 px-4 py-2 rounded-full border border-white/5 ${stat.color === 'green' ? 'text-green-500' : 'text-purple-400'}`}>
                {stat.trend}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <h3 className="text-4xl font-black tracking-tighter text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 glass p-12 rounded-[40px] animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-xs font-black tracking-[0.3em] uppercase text-white/50">Fluxo de Pipeline</h3>
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
          </div>
          <div className="space-y-10">
            {['iniciou_atendimento', 'conversando', 'agendamento', 'follow_up'].map(status => (
              <div key={status} className="space-y-4">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.1em]">
                  <span className="text-zinc-500 font-medium italic">{status.replace('_', ' ')}</span>
                  <span className="text-white font-black">{leads.filter(l => l.status === status).length} pts</span>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-900">
                  <div 
                    className="bg-purple-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                    style={{ width: `${(leads.filter(l => l.status === status).length / (leads.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-2 glass-no-blur p-12 rounded-[40px] animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-xs font-black tracking-[0.3em] uppercase text-zinc-500">Fluxo de Captação</h3>
            <button className="text-[10px] font-black text-white hover:text-purple-400 uppercase tracking-widest transition-colors border-b border-white/5 pb-1">Ver Ecossistema</button>
          </div>
          <div className="space-y-4">
            {leads.slice(0, 5).map(lead => (
              <div key={lead.id} className="flex items-center gap-8 p-6 hover:bg-zinc-950/50 rounded-3xl transition-all duration-500 cursor-pointer group border border-transparent hover:border-zinc-800">
                <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-[24px] flex items-center justify-center text-white font-black text-xl group-hover:scale-105 group-hover:border-purple-500/50 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                  {lead.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-xl font-black tracking-tighter text-white group-hover:text-purple-400 transition-colors uppercase italic">{lead.name}</p>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-medium mt-1">Status Ativo: <span className="text-white">{new Date(lead.created_at).toLocaleDateString()}</span></p>
                </div>
                <div className="text-right flex flex-col items-end gap-3">
                  <span className={`text-[10px] font-black uppercase p-1.5 rounded-lg border tracking-[0.2em] ${lead.ai_score > 80 ? 'text-green-400 border-green-500/20' : 'text-zinc-600 border-zinc-900'} bg-black shadow-inner`}>
                    {lead.ai_score ? `${lead.ai_score}% IA` : '??% IA'}
                  </span>
                  <span className="text-[9px] font-black uppercase py-2 px-5 bg-zinc-950 text-purple-400 rounded-full border border-zinc-900 group-hover:border-purple-500/30 transition-all tracking-[0.1em]">
                    {lead.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {leads.length === 0 && <p className="text-center py-24 text-[11px] text-zinc-900 uppercase tracking-[1em] font-black">Nefelibata. Nenhuma ação registrada.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

// Leads Page (Structural Redesign)
const Leads = () => {
  const { leads, loading, addLead } = useLeads()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAddLead = async (leadData: any) => {
    setIsAnalyzing(true)
    try {
      const analysis = await analyzeLead(leadData)
      await addLead({
        ...leadData,
        ai_score: analysis.score_potencial,
        ai_tags: analysis.tags_ai,
        ai_summary: analysis.ai_summary
      })
    } catch (err) {
      console.error('AI Error:', err)
      await addLead(leadData)
    } finally {
      setIsAnalyzing(false)
      setIsModalOpen(false)
    }
  }

  if (loading) return <div className="text-zinc-800 flex items-center justify-center min-h-[50vh] font-black uppercase text-xs tracking-[0.5em]">Mapeando Pipeline...</div>

  return (
    <div className="space-y-16 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div>
          <h2 className="text-7xl font-black tracking-tighter mb-4 text-white">Ecossistema</h2>
          <p className="text-[11px] text-zinc-600 uppercase tracking-[0.6em] font-light">Controle de leads de alta performance UNICO.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-12 py-6 rounded-full font-black text-xs uppercase tracking-widest hover:bg-purple-400 hover:scale-[1.03] transition-all duration-500 shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 flex items-center gap-4 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span>Inserir Novo Lead Premium</span>
        </button>
      </div>

      <div className="glass-no-blur rounded-[50px] overflow-hidden shadow-2xl relative border border-zinc-800/50">
        <div className="p-10 border-b border-zinc-900 bg-zinc-950/30 flex flex-col md:flex-row gap-8 items-center">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 transition-colors group-focus-within:text-purple-400" />
            <input 
              placeholder="PESQUISAR DADOS ESTRATÉGICOS..." 
              className="w-full bg-zinc-950 border border-zinc-900 rounded-[24px] pl-16 pr-8 py-5 text-[11px] font-bold text-white tracking-widest focus:outline-none focus:border-purple-500/40 transition-all placeholder:text-zinc-800"
            />
          </div>
          <button className="flex items-center gap-4 px-10 py-5 bg-zinc-950 border border-zinc-900 rounded-[24px] text-zinc-600 hover:text-white transition-all group font-black uppercase text-[10px] tracking-widest">
            <Filter size={18} />
            Configurações de Filtro
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar px-5">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#000000] text-zinc-700 text-[11px] uppercase tracking-[0.3em] font-black border-b border-zinc-900">
              <tr>
                <th className="px-10 py-8">Designer Lead</th>
                <th className="px-10 py-8">Social Identity</th>
                <th className="px-10 py-8 text-center">Score IA</th>
                <th className="px-10 py-8">Budget</th>
                <th className="px-10 py-8">Pipeline</th>
                <th className="px-10 py-8 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-950/40 transition-all duration-300 group">
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-8">
                      <div className="w-14 h-14 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-lg font-black group-hover:border-purple-500/40 group-hover:text-purple-400 transition-all text-white shadow-lg">
                        {lead.name[0]}
                      </div>
                      <div>
                        <p className="text-xl font-black tracking-tighter text-white italic">{lead.name}</p>
                        <p className="text-[9px] text-zinc-700 font-extrabold tracking-[0.4em] mt-1 uppercase">UNICO HIGH TICKET</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <div className="space-y-3">
                       <div className="flex items-center gap-3 group/icon cursor-pointer">
                         <Globe size={16} className="text-purple-500 opacity-40 group-hover/icon:opacity-100 transition-opacity" />
                         <span className="text-xs text-zinc-500 font-bold tracking-tight group-hover/icon:text-white transition-colors">{lead.instagram || '@UNICO.STUDIO'}</span>
                       </div>
                       <div className="flex items-center gap-3 group/icon cursor-pointer">
                         <Smartphone size={16} className="text-purple-500 opacity-40 group-hover/icon:opacity-100 transition-opacity" />
                         <span className="text-xs text-zinc-500 font-bold tracking-tight group-hover/icon:text-white transition-colors whitespace-nowrap">{lead.whatsapp || '(00) 00000-0000'}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-10 text-center">
                    <div className="inline-block relative">
                       <div className={`text-[12px] font-black py-2 px-5 rounded-xl border-2 tracking-widest ${
                        (lead.ai_score || 0) > 80 
                        ? 'border-green-500/20 bg-green-500/5 text-green-400' 
                        : 'border-zinc-900 bg-zinc-950 text-zinc-700'
                       }`}>
                        {lead.ai_score || '??'}%
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <p className="text-lg font-black tracking-tighter text-white">R$ {lead.faturamento_estimado?.toLocaleString() || '0'}</p>
                  </td>
                  <td className="px-10 py-10">
                    <span className="text-[10px] font-black uppercase py-2.5 px-6 bg-black text-purple-400 rounded-full border border-zinc-900 group-hover:border-purple-500/30 transition-all tracking-[0.1em] shadow-inner">
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-10 text-right">
                    <button className="text-zinc-800 hover:text-white p-4 rounded-3xl bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all active:scale-90">
                      <Settings size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <AddLeadModal onClose={() => setIsModalOpen(false)} onAdd={handleAddLead} />}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl flex items-center justify-center z-[100] animate-in fade-in duration-500">
          <div className="text-center space-y-12 max-w-sm">
            <div className="relative inline-block scale-150 mb-10">
              <div className="w-24 h-24 border-2 border-zinc-900 rounded-full"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={32} className="text-purple-400 animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[11px] text-purple-400 font-black uppercase tracking-[0.8em] animate-pulse">Qualificando Lead</p>
              <h3 className="text-3xl font-black tracking-tighter text-white">IA processando viabilidade estrategica...</h3>
              <p className="text-xs text-zinc-600 font-light leading-relaxed">Cruzando dados de mercado e potencial de projeto no Studio UNICO.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Kanban Component
const Kanban = () => {
  const { leads, loading, updateLeadStatus } = useLeads()
  
  const columns = [
    { id: 'iniciou_atendimento', label: 'Estratégia', color: '#A855F7' },
    { id: 'conversando', label: 'Negociação', color: '#A855F7' },
    { id: 'agendamento', label: 'Briefing', color: '#A855F7' },
    { id: 'follow_up', label: 'Follow-up', color: '#A855F7' },
    { id: 'compareceu', label: 'Contrato', color: '#22C55E' },
  ]

  if (loading) return <div className="text-zinc-800 flex items-center justify-center min-h-[50vh] font-black uppercase text-xs tracking-[0.5em]">Ajustando Visão Radar...</div>

  return (
    <div className="space-y-16 animate-fade-in-up h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-7xl font-black tracking-tighter mb-4 text-white">Radar Pipeline</h2>
          <p className="text-[11px] text-zinc-600 uppercase tracking-[0.6em] font-light">Evolução de alta fidelidade UNICO Studio.</p>
        </div>
      </div>

      <div className="flex gap-10 overflow-x-auto pb-10 custom-scrollbar px-1 min-h-[700px]">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-[420px] flex flex-col gap-10">
            <div className="flex items-center justify-between px-8">
              <div className="flex items-center gap-6">
                <div 
                  className="w-1.5 h-12 rounded-full" 
                  style={{ backgroundColor: column.color, boxShadow: `0 0 20px ${column.color}40` }}
                ></div>
                <div>
                  <h3 className="font-black text-white uppercase text-[12px] tracking-[0.4em]">{column.label}</h3>
                  <p className="text-[10px] text-zinc-600 font-black tracking-widest mt-1">
                    {leads.filter(l => l.status === column.id).length} OPORTUNIDADES ELITE
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-zinc-950/20 glass-no-blur rounded-[64px] p-8 space-y-8 min-h-[600px] border border-zinc-900/50">
              {leads.filter(l => l.status === column.id).map(lead => (
                <div 
                  key={lead.id} 
                  className="bg-zinc-950 border border-zinc-900 p-10 rounded-[48px] hover:border-purple-500/30 hover:bg-zinc-900/40 transition-all duration-500 cursor-grab active:cursor-grabbing group shadow-2xl relative overflow-hidden"
                >
                  {(lead.ai_score || 0) > 80 && (
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/5 blur-[60px] rounded-full"></div>
                  )}

                  <div className="flex justify-between items-start mb-8">
                    <div className="flex-1">
                      <h4 className="text-2xl font-black text-white tracking-tighter group-hover:text-purple-400 transition-colors uppercase italic leading-none truncate">{lead.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-5">
                        {lead.ai_tags?.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-[9px] font-black uppercase py-1.5 px-4 bg-zinc-950 text-zinc-600 rounded-full border border-zinc-900 transition-all tracking-[0.1em]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] font-black py-2 px-4 rounded-xl border tracking-widest ${
                        (lead.ai_score || 0) > 80 ? 'border-green-500/20 text-green-400 bg-green-500/5' : 'border-zinc-900 text-zinc-700 bg-zinc-950'
                      }`}>
                        {lead.ai_score || '??'}% IA
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-10">
                    <p className="text-sm text-zinc-500 flex items-center gap-4 font-bold transition-colors hover:text-white">
                      <Globe size={16} className="text-purple-400" /> {lead.instagram || '@UNICO.DESIGN'}
                    </p>
                    <p className="text-xl text-white font-black tracking-tighter flex items-center gap-4">
                      <DollarSign size={18} className="text-green-500" /> R$ {lead.faturamento_estimado?.toLocaleString() || '0'}
                    </p>
                  </div>

                  <div className="relative group/select">
                    <select 
                      className="w-full bg-zinc-950 border border-zinc-900 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 rounded-[20px] px-8 py-5 focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer hover:text-white shadow-inner"
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    >
                      {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-800 group-hover/select:text-purple-400 transition-colors">
                      <TrendingUp size={16} />
                    </div>
                  </div>
                </div>
              ))}
              {leads.filter(l => l.status === column.id).length === 0 && (
                <div className="h-60 border border-dashed border-zinc-900 rounded-[48px] flex items-center justify-center bg-zinc-950/10">
                  <p className="text-[10px] text-zinc-900 font-black uppercase tracking-[1em]">Neutralizado</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// App Root
const App = () => {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <Router>
      <AuthGuard session={session} profile={profile} loading={loading} onSignOut={handleSignOut}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </AuthGuard>
    </Router>
  )
}

export default App
