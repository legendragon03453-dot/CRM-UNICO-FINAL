import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Columns, MessageSquare, Calendar, Settings, LogOut, Plus, Search, Filter, TrendingUp, DollarSign, UserCheck, Globe, Smartphone } from 'lucide-react'
import { useLeads } from './hooks/useLeads'
import { AddLeadModal } from './components/AddLeadModal'
import { analyzeLead } from './lib/gemini'
import { useAuth } from './hooks/useAuth'
import { Login } from './components/Login'

// Layout Component
const Layout = ({ children, profile, onSignOut }: { children: React.ReactNode, profile: any, onSignOut: () => void }) => {
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Users size={20} />, label: 'Leads', path: '/leads' },
    { icon: <Columns size={20} />, label: 'Kanban', path: '/kanban' },
    { icon: <MessageSquare size={20} />, label: 'Follow-up', path: '/follow-up' },
    { icon: <Calendar size={20} />, label: 'Agendamentos', path: '/appointments' },
    { icon: <Settings size={20} />, label: 'Configurações', path: '/settings' },
  ]

  return (
    <div className="flex w-full h-screen bg-[#0A0A0A]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#262626] flex flex-col p-4 bg-[#0A0A0A]">
        <div className="mb-8 px-2">
          <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tighter">UNICO</h1>
          <p className="text-xs text-[#A0A0A0]">Design Studio CRM</p>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                location.pathname === item.path 
                ? 'bg-[#1E3A8A] text-white' 
                : 'text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-[#F5F5F5]'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-[#262626] pt-4 space-y-4">
          <div className="px-3 py-2 bg-[#111111] border border-[#262626] rounded-xl">
            <p className="text-[10px] text-[#A0A0A0] uppercase font-bold tracking-widest mb-1">Operador Ativo</p>
            <p className="text-sm font-bold text-[#F5F5F5]">{profile?.full_name || 'Usuário UNICO'}</p>
            <p className="text-[10px] text-blue-500 font-bold uppercase">{profile?.role || 'Acessando...'}</p>
          </div>
          <button 
            onClick={onSignOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-[#A0A0A0] hover:text-[#EF4444] transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}

// Page Components
const Dashboard = () => {
  const { leads, loading } = useLeads()
  
  const stats = [
    { label: 'Total de Leads', value: leads.length, icon: <Users className="text-blue-500" />, trend: '+12.5%' },
    { label: 'Ativos agora', value: leads.filter(l => l.status === 'conversando').length, icon: <TrendingUp className="text-green-500" />, trend: '+3.2%' },
    { label: 'Faturamento Potencial', value: `R$ ${leads.reduce((acc, curr) => acc + (curr.faturamento_estimado || 0), 0).toLocaleString()}`, icon: <DollarSign className="text-yellow-500" />, trend: '+45.0%' },
    { label: 'Oportunidades', value: leads.filter(l => (l.ai_score || 0) > 80).length, icon: <UserCheck className="text-purple-500" />, trend: '+8.1%' },
  ]

  if (loading) return <div className="text-white">Carregando...</div>

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-[#F5F5F5]">Dashboard UNICO</h2>
        <p className="text-[#A0A0A0]">Visão geral do seu ecossistema de Social Selling.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="p-3 bg-[#1A1A1A] rounded-xl">{stat.icon}</span>
              <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{stat.trend}</span>
            </div>
            <p className="text-sm font-medium text-[#A0A0A0] mt-4">{stat.label}</p>
            <h3 className="text-2xl font-bold text-[#F5F5F5]">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="text-xl font-bold text-[#F5F5F5] mb-6">Volume por Status</h3>
          <div className="space-y-4">
            {['iniciou_atendimento', 'conversando', 'agendamento', 'follow_up'].map(status => (
              <div key={status} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0] capitalize">{status.replace('_', ' ')}</span>
                  <span className="text-[#F5F5F5] font-bold">{leads.filter(l => l.status === status).length}</span>
                </div>
                <div className="w-full bg-[#1A1A1A] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#1E3A8A] h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(leads.filter(l => l.status === status).length / (leads.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-xl font-bold text-[#F5F5F5] mb-6">Últimas Atividades</h3>
          <div className="space-y-4">
            {leads.slice(0, 5).map(lead => (
              <div key={lead.id} className="flex items-center gap-4 p-3 hover:bg-[#1A1A1A] rounded-xl transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 rounded-full flex items-center justify-center text-[#1E3A8A] font-bold">
                  {lead.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-[#F5F5F5] font-semibold group-hover:text-blue-400 transition-colors">{lead.name}</p>
                  <p className="text-xs text-[#A0A0A0]">Entrou em {new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase py-1 px-2 bg-blue-900/30 text-blue-400 rounded-lg">
                    {lead.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
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

  if (loading) return <div className="text-[#F5F5F5]">Carregando leads...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#F5F5F5]">Gestão de Leads</h2>
          <p className="text-[#A0A0A0]">Organize e acompanhe seus leads qualificados.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2563EB] transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={20} />
          <span>Novo Lead Premium</span>
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-[#262626] flex gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
            <input 
              placeholder="Buscar por nome, instagram ou telefone..." 
              className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg pl-10 pr-4 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#1E3A8A] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#262626] rounded-lg text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-[#F5F5F5] transition-all">
            <Filter size={18} />
            <span className="text-sm font-medium">Filtros</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#1A1A1A] text-[#A0A0A0] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Lead</th>
                <th className="px-6 py-4 font-semibold">Contato</th>
                <th className="px-6 py-4 font-semibold">Faturamento</th>
                <th className="px-6 py-4 font-semibold">Agendamento</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#161616] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center text-[10px] font-bold">
                        {lead.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#F5F5F5]">{lead.name}</p>
                        <p className="text-[10px] text-[#A0A0A0]">ID: {lead.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs text-[#A0A0A0] flex items-center gap-1.5"><Globe size={12} /> {lead.instagram || '-'}</p>
                      <p className="text-xs text-[#A0A0A0] flex items-center gap-1.5"><Smartphone size={12} /> {lead.whatsapp || '-'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono text-[#F5F5F5]">R$ {lead.faturamento_estimado?.toLocaleString() || '0'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs text-[#F5F5F5] font-medium">{lead.dia || 'Não definido'}</p>
                      <p className="text-[10px] text-[#A0A0A0]">{lead.horario || '--:--'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase py-1 px-2.5 bg-blue-900/30 text-blue-400 rounded-full border border-blue-800/30">
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#A0A0A0] hover:text-[#F5F5F5] p-2 rounded-lg hover:bg-[#262626] transition-all">
                      <Settings size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-[#A0A0A0]">Nenhum lead encontrado. Comece a prospectar!</p>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-t-[#1E3A8A] border-[#262626] rounded-full animate-spin mx-auto"></div>
            <p className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Gemini 3 analisando potencial do lead...</p>
          </div>
        </div>
      )}
    </div>
  )
}
const Kanban = () => {
  const { leads, loading, updateLeadStatus } = useLeads()
  
  const columns = [
    { id: 'iniciou_atendimento', label: 'Início', color: 'bg-blue-500' },
    { id: 'conversando', label: 'Conversando', color: 'bg-purple-500' },
    { id: 'agendamento', label: 'Agendado', color: 'bg-yellow-500' },
    { id: 'follow_up', label: 'Follow-up', color: 'bg-orange-500' },
    { id: 'compareceu', label: 'Fechado', color: 'bg-green-500' },
  ]

  if (loading) return <div className="text-white">Carregando quadro...</div>

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-[#F5F5F5]">Pipeline UNICO</h2>
        <p className="text-[#A0A0A0]">Mova seus leads através do funil de vendas estrategicamente.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
                <h3 className="font-bold text-[#F5F5F5] uppercase text-xs tracking-widest">{column.label}</h3>
                <span className="text-[10px] bg-[#1A1A1A] text-[#A0A0A0] px-2 py-0.5 rounded-full border border-[#262626]">
                  {leads.filter(l => l.status === column.id).length}
                </span>
              </div>
            </div>

            <div className="flex-1 bg-[#111111]/50 border border-[#262626] rounded-2xl p-4 space-y-4 min-h-[500px]">
              {leads.filter(l => l.status === column.id).map(lead => (
                <div 
                  key={lead.id} 
                  className="card p-4 bg-[#111111] hover:border-[#1E3A8A] transition-all cursor-grab active:cursor-grabbing group shadow-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-bold text-[#F5F5F5] group-hover:text-blue-400 transition-colors">{lead.name}</h4>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      (lead.ai_score || 0) > 70 ? 'bg-green-500/10 text-green-500' : 'bg-[#1A1A1A] text-[#A0A0A0]'
                    }`}>
                      AI: {lead.ai_score || '?'}/100
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-[#A0A0A0] flex items-center gap-2">
                      <Globe size={12} className="text-[#1E3A8A]" /> {lead.instagram || '-'}
                    </p>
                    <p className="text-xs text-[#A0A0A0] flex items-center gap-2">
                      <Smartphone size={12} className="text-[#1E3A8A]" /> {lead.whatsapp || '-'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {/* Placeholder buttons for moving status since we don't have full dnd yet */}
                    <select 
                      className="w-full bg-[#1A1A1A] border border-[#262626] text-[10px] text-[#A0A0A0] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#1E3A8A]"
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    >
                      {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              {leads.filter(l => l.status === column.id).length === 0 && (
                <div className="h-24 border-2 border-dashed border-[#262626] rounded-xl flex items-center justify-center">
                  <p className="text-[10px] text-[#262626] font-bold uppercase tracking-widest">Sem leads</p>
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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-[#262626] rounded-full animate-spin"></div>
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
