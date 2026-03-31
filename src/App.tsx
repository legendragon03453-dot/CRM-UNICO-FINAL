import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Columns, MessageSquare, Calendar, Settings, LogOut, Plus, Search, Filter, TrendingUp, DollarSign, UserCheck, Globe, Smartphone, Sparkles, Sun, Moon, ThumbsUp, ThumbsDown, Trash2, Clock, CheckCircle2, ChevronRight, X } from 'lucide-react'
import { useLeads, Lead } from './hooks/useLeads'
import { AddLeadModal } from './components/AddLeadModal'
import { analyzeLead } from './lib/gemini'
import { supabase } from './lib/supabaseClient'
import { Login } from './components/Login'

// Utility: Timer Formatter
const formatTimeElapsed = (startedAt?: string) => {
  if (!startedAt) return 'Agora'
  const diff = Date.now() - new Date(startedAt).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// Authentication Guard Component
const AuthGuard = ({ children, session, profile, loading, onSignOut }: any) => {
  if (loading) return <div className="h-screen bg-black flex items-center justify-center font-black uppercase text-xs tracking-[0.5em] text-zinc-800 animate-pulse">Sincronizando Ecossistema...</div>
  if (!session) return <Login />
  return <Layout profile={profile} onSignOut={onSignOut}>{children}</Layout>
}

// Layout Component (Fixed Sidebar Architecture)
const Layout = ({ children, profile, onSignOut }: { children: React.ReactNode, profile: any, onSignOut: () => void }) => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F4f4f5';
    }
  }, [isDarkMode]);

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Painel', path: '/' },
    { icon: <Users size={18} />, label: 'Leads', path: '/leads' },
    { icon: <Columns size={18} />, label: 'Pipeline', path: '/kanban' },
    { icon: <MessageSquare size={18} />, label: 'Follow-up', path: '/follow-up' },
    { icon: <Calendar size={18} />, label: 'Agenda', path: '/appointments' },
    { icon: <Settings size={18} />, label: 'Ajustes', path: '/settings' },
  ]

  return (
    <div className={`flex min-h-screen font-outfit selection:bg-purple-500/30 overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-900'}`}>
      <aside className={`w-64 fixed left-0 top-0 h-screen border-r flex flex-col p-6 z-50 transition-all duration-500 ${isDarkMode ? 'border-zinc-800 bg-black/50 backdrop-blur-xl' : 'border-zinc-200 bg-white'}`}>
        <div className="mb-12 px-2 flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-black tracking-tighter leading-none mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>UNICO</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-light">Designer Studio CRM</p>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'border-zinc-800 bg-zinc-900 text-purple-400 hover:text-white' : 'border-zinc-200 bg-zinc-50 text-orange-500 hover:text-black'}`}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${location.pathname === item.path ? (isDarkMode ? 'bg-zinc-900/50 text-white border border-zinc-800 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'bg-zinc-100 text-black border border-zinc-200') : (isDarkMode ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-black hover:bg-zinc-50')}`}>
              <span className={`transition-colors duration-300 ${location.pathname === item.path ? (isDarkMode ? 'text-purple-400' : 'text-purple-600') : 'group-hover:text-purple-500'}`}>{item.icon}</span>
              <span className="text-xs uppercase font-bold tracking-widest">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8 border-t border-transparent space-y-6">
          <div className={`px-4 py-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-900/40 border-zinc-800/50' : 'bg-zinc-50 border-zinc-200 shadow-sm'}`}>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-2">Operador Elite</p>
            <p className={`text-sm font-black tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{profile?.full_name || 'Agente Studio'}</p>
          </div>
          <button onClick={onSignOut} className="flex items-center gap-4 px-4 py-3 w-full text-zinc-500 hover:text-red-400 transition-all duration-300 group">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs uppercase font-bold tracking-widest">Sair do Studio</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-12 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}

const Dashboard = () => {
  const { leads, loading } = useLeads()
  const [profile, setProfile] = useState<any>(null)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data))
    })
  }, [])
  const stats = [
    { label: 'Pipeline Total', value: leads.length, icon: <Users size={18} />, color: 'purple', trend: '+12%' },
    { label: 'Follow-ups Ativos', value: leads.filter(l => l.status === 'follow_up').length, icon: <MessageSquare size={18} />, color: 'purple', trend: '+22%' },
    { label: 'Equity Projetos', value: `R$ ${leads.reduce((acc, curr) => acc + (Number(curr.faturamento_estimado) || 0), 0).toLocaleString()}`, icon: <DollarSign size={18} />, color: 'green', trend: '+28%' },
    { label: 'Match Elite (IA)', value: leads.filter(l => (l.ai_score || 0) > 80).length, icon: <Sparkles size={18} />, color: 'purple', trend: '+8%' },
  ]
  if (loading) return <div className="text-zinc-800 flex items-center justify-center min-h-[50vh] font-black uppercase text-xs tracking-[0.5em] animate-pulse">Sincronizando Ecossistema...</div>
  return (
    <div className="space-y-16 animate-fade-in-up uppercase">
      <div className="flex items-center justify-between"><h2 className="text-7xl font-black tracking-tighter mb-2 text-white">Painel Geral</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-10 rounded-[40px] flex flex-col gap-6 relative group hover:bg-zinc-900 transition-all shadow-2xl">
            <div className="flex items-center justify-between"><span className={`p-4 rounded-3xl bg-zinc-950 border border-zinc-800 ${stat.color === 'green' ? 'text-green-400' : 'text-purple-400'} group-hover:scale-110 transition-transform`}>{stat.icon}</span><span className={`text-[10px] font-black bg-white/5 px-4 py-2 rounded-full border border-white/5 ${stat.color === 'green' ? 'text-green-500' : 'text-purple-400'}`}>{stat.trend}</span></div>
            <div><p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2">{stat.label}</p><h3 className="text-4xl font-black tracking-tighter text-white">{stat.value}</h3></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-12 rounded-[40px] shadow-2xl space-y-12">
          <div className="flex items-center justify-between"><h3 className="text-xs font-black tracking-[0.3em] uppercase text-white/50">Performance: {profile?.full_name?.split(' ')[0]}</h3></div>
          <div className="space-y-8">
            <div className="space-y-6"><div className="flex items-center gap-3 text-green-400"><ThumbsUp size={16} /><span className="text-[10px] font-black tracking-widest">Pontos Fortes</span></div>
            <div className="flex flex-wrap gap-2">{(profile?.points_pos || ['Agilidade', 'Conversão Elite']).map((p: any, i: number) => (<span key={i} className="text-[10px] bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full text-green-400 font-bold">{p}</span>))}</div></div>
            <div className="space-y-6"><div className="flex items-center gap-3 text-red-400"><ThumbsDown size={16} /><span className="text-[10px] font-black tracking-widest">A Melhorar</span></div>
            <div className="flex flex-wrap gap-2">{(profile?.points_neg || ['Tempo de Resposta', 'CRM']).map((p: any, i: number) => (<span key={i} className="text-[10px] bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full text-red-500 font-bold">{p}</span>))}</div></div>
          </div>
        </div>
        <div className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-12 rounded-[40px] shadow-2xl">
           <div className="flex items-center justify-between mb-8"><h3 className="text-xs font-black tracking-[0.3em] uppercase text-zinc-500">Últimos Leads Sincronizados</h3></div>
           <div className="space-y-4">{leads.slice(0, 5).map(lead => (<div key={lead.id} className="flex items-center gap-8 p-6 hover:bg-zinc-950/50 rounded-3xl transition-all group border border-transparent hover:border-zinc-800"><div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-[24px] flex items-center justify-center text-white font-black text-xl group-hover:scale-105 transition-all">{lead.name?.[0]}</div><div className="flex-1 overflow-hidden"><p className="text-xl font-black tracking-tighter text-white group-hover:text-purple-400 transition-colors uppercase italic truncate">{lead.name}</p><p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-medium mt-1">Status: <span className="text-purple-400">{lead.status?.replace('_', ' ')}</span></p></div><div className="text-right text-xs font-black text-white">{lead.ai_score || 0}% IA</div></div>))}</div>
        </div>
      </div>
    </div>
  )
}

const Leads = () => {
  const { leads, loading, addLead } = useLeads()
  const [profile, setProfile] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data))
    })
  }, [])
  const handleAddLead = async (leadData: any) => {
    setIsAnalyzing(true)
    try {
      const analysis = await analyzeLead(leadData)
      await addLead({ ...leadData, owner_id: profile?.id, ai_score: analysis.score_potencial, ai_tags: analysis.tags_ai, ai_summary: analysis.ai_summary })
    } catch (err) { await addLead({ ...leadData, owner_id: profile?.id }) }
    finally { setIsAnalyzing(false); setIsModalOpen(false); }
  }
  if (loading) return <div className="text-zinc-800 flex items-center justify-center min-h-[50vh] font-black uppercase text-xs tracking-[0.5em] animate-pulse">Sincronizando...</div>
  return (
    <div className="space-y-16 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-end gap-10"><div><h2 className="text-7xl font-black tracking-tighter mb-4 text-white">Ecossistema</h2><p className="text-[11px] text-zinc-600 uppercase tracking-[0.6em] font-light">Controle de leads de alta performance UNICO.</p></div><button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-12 py-6 rounded-full font-black text-xs uppercase tracking-widest hover:bg-purple-400 transition-all shadow-xl flex items-center gap-4 group active:scale-95"><Plus size={20} className="group-hover:rotate-90 transition-transform" /><span>Cadastrar Novo Lead Elite</span></button></div>
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-[50px] overflow-hidden shadow-2xl relative">
        <div className="p-10 border-b border-zinc-900 bg-zinc-950/30 flex gap-8 items-center"><Search size={18} className="text-zinc-700" /><input placeholder="PESQUISAR DADOS ESTRATÉGICOS..." className="w-full bg-zinc-950 border border-zinc-900 rounded-[24px] px-10 py-5 text-[11px] font-bold text-white tracking-widest focus:outline-none" /></div>
        <div className="overflow-x-auto custom-scrollbar px-5">
          <table className="w-full text-left border-collapse"><thead className="text-zinc-700 text-[11px] uppercase tracking-[0.3em] font-black border-b border-zinc-900"><tr><th className="px-10 py-8">Lead Designer</th><th className="px-10 py-8 text-center">IA Score</th><th className="px-10 py-8">Budget</th><th className="px-10 py-8">Status</th><th className="px-10 py-8 text-right">Ajustes</th></tr></thead>
            <tbody className="divide-y divide-zinc-900">{leads.map((lead) => (<tr key={lead.id} className="hover:bg-zinc-950/40 group"><td className="px-10 py-10"><div className="flex items-center gap-8"><div className="w-14 h-14 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-lg font-black text-white">{lead.name?.[0]}</div><div><p className="text-xl font-black tracking-tighter text-white italic truncate max-w-[200px]">{lead.name}</p><p className="text-[9px] text-zinc-700 font-extrabold tracking-[0.4em] mt-1">UNICO HIGH TICKET</p></div></div></td><td className="px-10 py-10 text-center"><span className={`text-[12px] font-black py-2 px-5 rounded-xl border-2 tracking-widest ${ (lead.ai_score || 0) > 80 ? 'border-green-500/20 text-green-400' : 'border-zinc-900 text-zinc-700' }`}>{lead.ai_score || 0}%</span></td><td className="px-10 py-10 font-black text-lg text-white">R$ {Number(lead.faturamento_estimado || 0).toLocaleString()}</td><td className="px-10 py-10"><span className="text-[10px] font-black uppercase py-2.5 px-6 bg-black text-purple-400 rounded-full border border-zinc-900">{lead.status?.replace('_', ' ')}</span></td><td className="px-10 py-10 text-right"><button className="text-zinc-800 hover:text-white p-4"><Settings size={20} /></button></td></tr>))}</tbody>
          </table>
        </div>
      </div>
      {isModalOpen && <AddLeadModal profile={profile} onClose={() => setIsModalOpen(false)} onAdd={handleAddLead} />}
      {isAnalyzing && (<div className="fixed inset-0 bg-black/98 backdrop-blur-3xl flex items-center justify-center z-[100] animate-fade-in"><div className="text-center space-y-8"><Sparkles size={48} className="text-purple-400 animate-pulse mx-auto" /><h3 className="text-3xl font-black text-white">IA Qualificando Lead...</h3></div></div>)}
    </div>
  )
}

const FollowUp = () => {
  const { leads, loading, updateLeadStatus, updateFollowUpPhase, deleteLead } = useLeads()
  const followUpLeads = leads.filter(l => l.status === 'follow_up')
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, [])
  const phases = [{ title: 'Conexão', desc: 'Atração' }, { title: 'Valor', desc: 'Apresentação' }, { title: 'Oferta', desc: 'Fechamento' }]
  if (loading) return <div className="text-zinc-800 flex items-center justify-center min-h-[50vh] font-black uppercase animate-pulse">Sincronizando Radar...</div>
  return (
    <div className="space-y-16 animate-fade-in-up">
      <div className="flex items-center justify-between"><div><h2 className="text-7xl font-black tracking-tighter mb-4 text-white uppercase italic">Radar de Follow-up</h2><p className="text-[11px] text-zinc-600 uppercase tracking-[0.6em] font-light">Monitoramento temporal de alta conversão UNICO Studio.</p></div></div>
      <div className="grid grid-cols-1 gap-8">{followUpLeads.map(lead => (
          <div key={lead.id} className="bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800/50 p-10 rounded-[50px] flex flex-col md:flex-row items-center gap-12 group hover:bg-zinc-900/60 transition-all shadow-2xl relative overflow-hidden">
             <div className="flex items-center gap-8 min-w-[300px]"><div className="w-20 h-20 bg-zinc-950 border border-zinc-900 rounded-[30px] flex items-center justify-center text-3xl font-black text-white group-hover:border-purple-500/40 transition-all shadow-xl">{lead.name?.[0]}</div><div><h4 className="text-2xl font-black text-white tracking-tighter uppercase italic">{lead.name}</h4><div className="flex items-center gap-3 mt-3 text-purple-400 text-[10px] font-black uppercase tracking-[0.3em]"><Clock size={14} /><span>Follow-up desde: <span className="text-white text-[12px]">{formatTimeElapsed(lead.status_changed_at)}</span></span></div></div></div>
             <div className="flex-1 flex gap-4">{phases.map((phase, i) => (<button key={i} onClick={() => updateFollowUpPhase(lead.id, i + 1)} className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-[32px] border transition-all ${ (lead.follow_up_phase || 0) >= i + 1 ? 'bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-xl' : 'bg-zinc-950 border-zinc-900/50 text-zinc-700 hover:text-white' }`}><div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">{ (lead.follow_up_phase || 0) > i + 1 ? <CheckCircle2 size={16} /> : <span>{i + 1}</span> }{phase.title}</div></button>))}</div>
             <div className="flex items-center gap-6"><button onClick={() => updateLeadStatus(lead.id, 'compareceu')} className="bg-white text-black p-5 rounded-full hover:bg-green-500 hover:text-white transition-all shadow-lg active:scale-90"><UserCheck size={20} /></button><button onClick={() => { if(confirm('Remover lead?')) deleteLead(lead.id) }} className="bg-black border border-zinc-900 text-zinc-700 p-5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-all shadow-lg active:scale-90"><Trash2 size={20} /></button></div>
          </div>
        ))}{followUpLeads.length === 0 && <div className="py-40 text-center animate-pulse space-y-8"><MessageSquare size={40} className="mx-auto text-zinc-900" /><p className="text-[11px] text-zinc-900 font-black uppercase tracking-[1em]">Radar Sincronizado. Ninguém em espera.</p></div>}</div>
    </div>
  )
}

const Kanban = () => {
  const { leads, loading, updateLeadStatus } = useLeads()
  const columns = [{ id: 'iniciou_atendimento', label: 'Estratégia', color: '#A855F7' }, { id: 'conversando', label: 'Negociação', color: '#A855F7' }, { id: 'agendamento', label: 'Briefing', color: '#A855F7' }, { id: 'follow_up', label: 'Follow-up', color: '#A855F7' }, { id: 'compareceu', label: 'Contrato', color: '#22C55E' }]
  if (loading) return <div className="text-zinc-800 flex items-center justify-center min-h-[50vh] font-black uppercase animate-pulse">Sincronizando Ecossistema...</div>
  return (
    <div className="space-y-16 animate-fade-in-up h-full"><div className="flex items-center justify-between"><h2 className="text-7xl font-black tracking-tighter mb-4 text-white uppercase italic">Pipeline de Elite</h2></div>
      <div className="flex gap-10 overflow-x-auto pb-10 custom-scrollbar px-1 min-h-[700px]">{columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-[420px] flex flex-col gap-10"><div className="flex items-center gap-6 px-8"><div className="w-1.5 h-12 rounded-full" style={{ backgroundColor: column.color, boxShadow: `0 0 20px ${column.color}40` }}></div><div><h3 className="font-black text-white uppercase text-[12px] tracking-[0.4em]">{column.label}</h3><p className="text-[10px] text-zinc-600 font-black tracking-widest mt-1 uppercase">{leads.filter(l => l.status === column.id).length} OPORTUNIDADES</p></div></div>
            <div className="flex-1 bg-zinc-950/20 rounded-[64px] p-8 space-y-8 min-h-[600px] border border-zinc-900/50 backdrop-blur-sm">{leads.filter(l => l.status === column.id).map(lead => (
                <div key={lead.id} className="bg-zinc-950 border border-zinc-900 p-10 rounded-[48px] hover:border-purple-500/30 hover:bg-zinc-900/40 transition-all duration-500 shadow-2xl relative overflow-hidden"><div className="flex justify-between items-start mb-8"><h4 className="text-2xl font-black text-white tracking-tighter uppercase italic pr-2 truncate">{lead.name}</h4><span className="text-[11px] font-black py-2 px-4 rounded-xl border border-zinc-900 text-zinc-700 bg-zinc-950">{lead.ai_score || 0}%</span></div>
                  <div className="relative group/select"><select className="w-full bg-zinc-950 border border-zinc-900 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 rounded-[20px] px-8 py-5 focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer" value={lead.status} onChange={(e) => updateLeadStatus(lead.id, e.target.value)}>{columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select><div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-800"><ChevronRight size={16} /></div></div>
                </div>))}
            </div></div>))}</div></div>
  )
}

const App = () => {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); if (session) fetchProfile(session.user.id); setLoading(false); })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); if (session) fetchProfile(session.user.id); else setProfile(null); })
    return () => subscription.unsubscribe()
  }, [])
  const fetchProfile = async (userId: string) => { const { data } = await supabase.from('profiles').select('*').eq('id', userId).single(); setProfile(data); }
  return (
    <Router><AuthGuard session={session} profile={profile} loading={loading} onSignOut={() => supabase.auth.signOut()}>
        <Routes><Route path="/" element={<Dashboard />} /><Route path="/leads" element={<Leads />} /><Route path="/kanban" element={<Kanban />} /><Route path="/follow-up" element={<FollowUp />} /><Route path="*" element={<Dashboard />} /></Routes>
      </AuthGuard></Router>
  )
}
export default App
