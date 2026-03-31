import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LayoutDashboard, Users, Columns, MessageSquare, Calendar as CalendarIcon, Settings, LogOut, Plus, Search, Filter, TrendingUp, DollarSign, UserCheck, Globe, Smartphone, Sparkles, Sun, Moon, ThumbsUp, ThumbsDown, Trash2, Clock, CheckCircle2, ChevronRight, X, Flame, AlertCircle, Briefcase, Calendar } from 'lucide-react'
import { useLeads, Lead } from './hooks/useLeads'
import { AddLeadModal } from './components/AddLeadModal'
import { analyzeLead } from './lib/gemini'
import { supabase } from './lib/supabaseClient'
import { Login } from './components/Login'

// Utility: Timer Formatter
const formatTimeElapsed = (startedAt?: string) => {
  if (!startedAt) return 'AGORA'
  const diff = Date.now() - new Date(startedAt).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}D ${hours % 24}H`
  if (hours > 0) return `${hours}H ${minutes}M`
  return `${minutes}M`
}

// Authentication Guard Component
const AuthGuard = ({ children, session, profile, loading, onSignOut }: any) => {
  if (loading) return <div className="h-screen bg-[#14130E] flex items-center justify-center font-black uppercase text-xs tracking-[0.5em] text-zinc-900 animate-pulse">SINCRONIZANDO STUDIO...</div>
  if (!session) return <Login />
  return <Layout profile={profile} onSignOut={onSignOut}>{children}</Layout>
}

// Layout Component (Fixed Sidebar Architecture - Linear Edition)
const Layout = ({ children, profile, onSignOut }: { children: React.ReactNode, profile: any, onSignOut: () => void }) => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'PAINEL', path: '/' },
    { icon: <Users size={18} />, label: 'ECOSSISTEMA', path: '/leads' },
    { icon: <Columns size={18} />, label: 'PIPELINE', path: '/kanban' },
    { icon: <MessageSquare size={18} />, label: 'FOLLOW-UP', path: '/follow-up' },
    { icon: <CalendarIcon size={18} />, label: 'AGENDA STUDIO', path: '/appointments' },
    { icon: <Settings size={18} />, label: 'AJUSTES', path: '/settings' },
  ]

  return (
    <div className={`flex min-h-screen font-outfit selection:bg-white/10 overflow-x-hidden transition-colors duration-500 bg-[#14130E] text-white`}>
      <aside className={`w-64 fixed left-0 top-0 h-screen border-r border-[#2A2922] bg-[#14130E] flex flex-col p-6 z-50 rounded-none`}>
        <div className="mb-12 px-2 flex items-center justify-between border-b border-[#2A2922] pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter leading-none mb-1 text-white italic">UNICO</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-light">Linear Designer CRM</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-4 py-4 rounded-none transition-all duration-200 group ${location.pathname === item.path ? 'bg-white text-black font-black' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}>
              <span className={`transition-colors duration-200 ${location.pathname === item.path ? 'text-black' : 'group-hover:text-white'}`}>{item.icon}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8 border-t border-[#2A2922] space-y-6">
          <div className="px-4 py-4 bg-[#1C1B16] border border-[#2A2922] rounded-none">
            <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-[0.2em] mb-2 font-black">OPERADOR ELITE</p>
            <p className="text-sm font-black tracking-tighter truncate text-white uppercase italic">{profile?.full_name || 'STUDIO AGENT'}</p>
          </div>
          <button onClick={onSignOut} className="flex items-center gap-4 px-4 py-3 w-full text-zinc-700 hover:text-white transition-all group">
            <LogOut size={18} /><span className="text-xs uppercase font-bold tracking-widest">FECHAR SISTEMA</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-12 overflow-x-hidden min-h-screen">
        <div className="max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  )
}

// Temperature Badge Component
const TempBadge = ({ temp }: { temp?: string }) => {
  const colors = {
    'frio': 'border-blue-500/20 text-blue-400 bg-blue-500/5',
    'morno': 'border-orange-500/20 text-orange-400 bg-orange-500/5',
    'quente': 'border-red-500/20 text-red-400 bg-red-500/5'
  }
  return (
    <span className={`text-[9px] font-black uppercase px-3 py-1 border tracking-widest ${colors[temp as keyof typeof colors] || colors.frio}`}>
       {temp || 'FRIO'}
    </span>
  )
}

// Meeting Scheduler Modal
const ScheduleModal = ({ lead, onClose, onSave }: { lead: Lead, onClose: () => void, onSave: (date: string, time: string) => void }) => {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  return (
     <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 z-[300] animate-in fade-in transition-all">
        <div className="w-full max-w-md bg-[#1C1B16] border border-[#2A2922] p-12 space-y-10 rounded-none shadow-2xl">
           <div className="space-y-2">
             <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">AGENDAR REUNIÃO ELITE</h3>
             <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">DEFINA O DIA E HORÁRIO PARA {lead.name}</p>
           </div>
           <div className="space-y-6">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">DATA DO ENCONTRO</label>
               <input type="date" className="w-full bg-[#14130E] border border-[#2A2922] p-4 text-white text-xs font-black outline-none focus:border-white transition-all uppercase" value={date} onChange={e => setDate(e.target.value)} />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">HORÁRIO EXCLUSIVO</label>
               <input type="time" className="w-full bg-[#14130E] border border-[#2A2922] p-4 text-white text-xs font-black outline-none focus:border-white transition-all" value={time} onChange={e => setTime(e.target.value)} />
             </div>
           </div>
           <div className="flex gap-4 pt-10">
              <button onClick={onClose} className="flex-1 py-4 border border-[#2A2922] text-[10px] font-black uppercase text-zinc-600 hover:text-white">CANCELAR</button>
              <button onClick={() => onSave(date, time)} className="flex-2 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200">CONFIRMAR AGENDA</button>
           </div>
        </div>
     </div>
  )
}

// Kanban Component: The Rebranded Heart
const Kanban = () => {
  const { leads, loading, updateLeadStatus, updateMeetingSchedule, deleteLead } = useLeads()
  const [schedulingLead, setSchedulingLead] = useState<Lead | null>(null)

  const columns = [
    { id: 'novo_lead', label: 'NOVO LEAD / INBOX', color: '#FFFFFF' },
    { id: 'iniciou_atendimento', label: 'INICIOU ATENDIMENTO', color: '#FFFFFF' },
    { id: 'conversando', label: 'CONVERSANDO', color: '#FFFFFF' },
    { id: 'aguardando_resposta', label: 'AGUARDANDO RESPOSTA', color: '#FFFFFF' },
    { id: 'follow_up', label: 'FOLLOW UP', color: '#FAA700' },
    { id: 'reuniao_agendada', label: 'REUNIÃO AGENDADA', color: '#FAA700' },
    { id: 'compareceu', label: 'COMPARECEU', color: '#FAA700' },
    { id: 'vendido', label: 'VENDIDO', color: '#22C55E' },
    { id: 'perdido', label: 'PERDIDO / SEM CONTATO', color: '#EF4444' },
  ]

  const onDragEnd = (result: any) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    const lead = leads.find(l => l.id === draggableId)
    if (!lead) return
    
    // Check for scheduling trigger
    if (destination.droppableId === 'reuniao_agendada' && lead.status !== 'reuniao_agendada') {
      setSchedulingLead(lead)
    } else {
      updateLeadStatus(draggableId, destination.droppableId)
    }
  }

  if (loading) return <div className="text-zinc-800 flex items-center justify-center min-h-[50vh] font-black uppercase animate-pulse">MAPEANDO PIPELINE...</div>

  return (
    <div className="space-y-16 animate-fade-in-up h-full">
      <h2 className="text-8xl font-black tracking-tighter mb-4 text-white italic">PIPELINE LINEAR</h2>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-8 overflow-x-auto pb-10 custom-scrollbar px-1 min-h-[850px] items-start">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex-shrink-0 w-[380px] flex flex-col gap-8 bg-[#1C1B16]/20 border border-[#2A2922] p-6 pb-20 rounded-none relative">
                  <div className="flex items-center gap-4 border-b border-[#2A2922] pb-6 px-2">
                    <div className="w-1 h-8 rounded-none" style={{ backgroundColor: column.color }}></div>
                    <div className="flex-1">
                      <h3 className="font-black text-white uppercase text-[11px] tracking-widest leading-none">{column.label}</h3>
                      <p className="text-[9px] text-zinc-600 font-bold tracking-widest mt-2">{leads.filter(l => l.status === column.id).length} OPORTUNIDADES ELITE</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {leads.filter(l => l.status === column.id).map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            {...provided.dragHandleProps}
                            className={`bg-[#1C1B16] border border-[#2A2922] p-8 rounded-none transition-all duration-300 relative group shadow-xl ${snapshot.isDragging ? 'dnd-dragging' : 'hover:border-zinc-400'}`}
                          >
                             <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                   <div className="flex gap-2 mb-3">
                                      <TempBadge temp={lead.temperature} />
                                      {lead.status === 'vendido' && <span className="text-[9px] font-black bg-green-500 text-black px-2 py-1 uppercase tracking-tighter">FECHAMENTO</span>}
                                   </div>
                                   <h4 className="text-xl font-black text-white tracking-widest group-hover:text-zinc-200 uppercase italic truncate">{lead.name}</h4>
                                </div>
                                <span className={`text-[10px] font-bold py-1 px-3 border border-zinc-900 bg-black text-zinc-500 uppercase tracking-widest`}>{lead.ai_score || 0}%</span>
                             </div>

                             <div className="space-y-4 mb-8">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-3">
                                   <Briefcase size={12} className="text-white/20" /> {lead.product_type || 'PRODUTO NÃO DEFINIDO'}
                                </p>
                                <p className="text-lg text-white font-black tracking-tighter uppercase italic flex items-center gap-3">
                                   R$ {Number(lead.faturamento_estimado || 0).toLocaleString()}
                                </p>
                             </div>

                             <div className="border-t border-zinc-800 pt-6 flex justify-between items-center">
                                <div className="flex flex-col gap-1">
                                   <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">RESISTRO:</p>
                                   <p className="text-[10px] text-zinc-400 font-bold tracking-tighter uppercase italic truncate max-w-[150px]">{lead.registered_by_name || 'AGENTE STUDIO'}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button onClick={() => deleteLead(lead.id)} className="p-2 text-zinc-800 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                   <button className="p-2 text-zinc-800 hover:text-white transition-colors"><ChevronRight size={16} /></button>
                                </div>
                             </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      {schedulingLead && (
        <ScheduleModal 
          lead={schedulingLead} 
          onClose={() => setSchedulingLead(null)} 
          onSave={(date, time) => {
            updateMeetingSchedule(schedulingLead.id, date, time)
            setSchedulingLead(null)
          }} 
        />
      )}
    </div>
  )
}

// Agenda Component (Calendar View) - The New Visual Center
const Agenda = () => {
  const { leads, loading } = useLeads()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const meetings = leads.filter(l => l.meeting_date)

  const days = eachDayOfInterval({ 
    start: startOfWeek(startOfMonth(currentMonth)), 
    end: endOfWeek(endOfMonth(currentMonth)) 
  })

  if (loading) return <div className="text-zinc-800 flex items-center justify-center min-h-[50vh] font-black uppercase animate-pulse">COORDENANDO AGENDA...</div>

  return (
    <div className="space-y-16 animate-fade-in-up">
       <div className="flex items-center justify-between">
         <div>
           <h2 className="text-8xl font-black tracking-tighter mb-4 text-white uppercase italic">AGENDA ELITE</h2>
           <p className="text-[11px] text-zinc-600 uppercase tracking-[0.6em]">SINCRONIZAÇÃO DE ATENDIMENTOS UNICO STUDIO.</p>
         </div>
         <div className="flex items-center gap-8 bg-[#1C1B16] border border-[#2A2922] p-4 text-white uppercase font-black text-xs tracking-widest italic">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="hover:text-zinc-400 p-2"><ChevronRight size={20} className="rotate-180" /></button>
            <span>{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="hover:text-zinc-400 p-2"><ChevronRight size={20} /></button>
         </div>
       </div>

       <div className="grid grid-cols-7 border border-[#2A2922] bg-[#1C1B16]/20">
         {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(d => (
           <div key={d} className="p-6 text-center text-[10px] font-black text-zinc-600 border-b border-[#2A2922] tracking-[1em]">{d}</div>
         ))}
         {days.map((day, i) => {
           const dayMeetings = meetings.filter(m => isSameDay(new Date(m.meeting_date!), day))
           return (
             <div key={i} className={`min-h-[180px] p-4 border-[#2A2922] ${i % 7 !== 6 ? 'border-r' : ''} border-b relative ${!isSameMonth(day, currentMonth) ? 'opacity-20' : ''}`}>
               <span className={`text-[10px] font-black ${isSameDay(day, new Date()) ? 'text-white' : 'text-zinc-900 group-hover:text-zinc-600'}`}>{format(day, 'd')}</span>
               <div className="mt-4 space-y-2">
                 {dayMeetings.map((m, j) => (
                   <div key={j} className="bg-white text-black p-3 text-[9px] font-black uppercase tracking-tighter leading-tight flex flex-col gap-1 border-l-4 border-zinc-400">
                     <span className="text-[8px] opacity-60">{m.meeting_time}H</span>
                     <span className="truncate">{m.name}</span>
                   </div>
                 ))}
               </div>
             </div>
           )
         })}
       </div>
    </div>
  )
}

// Leads Page Implementation (Table)
const Leads = () => {
  const { leads, loading, addLead } = useLeads()
  const [profile, setProfile] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { if (user) supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data)) })
  }, [])
  const handleAddLead = async (leadData: any) => {
    setIsAnalyzing(true)
    try {
      const analysis = await analyzeLead(leadData)
      await addLead({ ...leadData, owner_id: profile?.id, registered_by_name: profile?.full_name, ai_score: analysis.score_potencial, ai_tags: analysis.tags_ai, ai_summary: analysis.ai_summary })
    } catch (err) { await addLead({ ...leadData, owner_id: profile?.id, registered_by_name: profile?.full_name }) }
    finally { setIsAnalyzing(false); setIsModalOpen(false); }
  }
  if (loading) return <div className="text-zinc-900 flex items-center justify-center min-h-[50vh] font-black uppercase animate-pulse">SINCRONIZANDO...</div>
  return (
    <div className="space-y-16 animate-fade-in-up uppercase">
       <div className="flex justify-between items-end gap-10"><div><h2 className="text-8xl font-black tracking-tighter mb-4 text-white italic">ECOSSISTEMA</h2><p className="text-[11px] text-zinc-600 uppercase tracking-[0.5em] font-light">CONTROLE DE LEADS LINEAR STUDIO.</p></div><button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-12 py-6 font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-4 group active:scale-95"><Plus size={18} /><span>CADASTRAR LEAD ELITE</span></button></div>
       <div className="bg-[#1C1B16] border border-[#2A2922] rounded-none overflow-hidden">
          <div className="p-10 border-b border-[#2A2922] bg-[#14130E] flex items-center gap-8"><Search size={18} className="text-zinc-800" /><input placeholder="PESQUISAR DADOS DE ALTA FIDELIDADE..." className="w-full bg-transparent p-4 text-[10px] font-black text-white tracking-widest outline-none uppercase placeholder:text-zinc-900" /></div>
          <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead className="text-zinc-700 text-[10px] uppercase tracking-[0.4em] font-black border-b border-[#2A2922]"><tr><th className="px-10 py-8">DISCIPLINA / NOME</th><th className="px-10 py-8 text-center">TEMP.</th><th className="px-10 py-8">INVESTIMENTO</th><th className="px-10 py-8">ESTÁGIO</th><th className="px-10 py-8 text-right">AÇÕES</th></tr></thead>
            <tbody>{leads.map((lead) => (<tr key={lead.id} className="hover:bg-white/5 border-b border-[#2A2922] transition-colors"><td className="px-10 py-8 flex items-center gap-6"><div className="w-12 h-12 bg-[#14130E] border border-zinc-800 flex items-center justify-center text-white font-black">{lead.name?.[0]}</div><div><p className="text-lg font-black tracking-widest text-white italic truncate max-w-[200px]">{lead.name}</p><p className="text-[8px] text-zinc-800 font-bold tracking-[0.5em] mt-1">{lead.product_type}</p></div></td><td className="px-10 py-8 text-center"><TempBadge temp={lead.temperature} /></td><td className="px-10 py-8 text-white font-black text-lg">R$ {Number(lead.faturamento_estimado || 0).toLocaleString()}</td><td className="px-10 py-8"><span className="text-[9px] font-black uppercase py-2 px-6 border border-zinc-900 bg-black text-zinc-600">{lead.status?.replace('_', ' ')}</span></td><td className="px-10 py-8 text-right"><button className="text-zinc-800 hover:text-white"><Settings size={18} /></button></td></tr>))}</tbody></table></div>
       </div>
       {isModalOpen && <AddLeadModal profile={profile} onClose={() => setIsModalOpen(false)} onAdd={handleAddLead} />}
       {isAnalyzing && (<div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] animate-in fade-in transition-all"><h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">IA QUALIFICANDO DADOS...</h3></div>)}
    </div>
  )
}

// FollowUp Component implementation
const FollowUp = () => {
  const { leads, loading, updateLeadStatus, updateFollowUpPhase, deleteLead } = useLeads()
  const followUpLeads = leads.filter(l => l.status === 'follow_up')
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, [])
  const phases = [{ title: 'CONEXÃO', desc: '' }, { title: 'VALOR', desc: '' }, { title: 'OFERTA', desc: '' }]
  if (loading) return <div className="text-zinc-900 flex items-center justify-center min-h-[50vh] font-black uppercase animate-pulse">SINCRONIZANDO RADAR...</div>
  return (
    <div className="space-y-16 animate-fade-in-up uppercase">
      <h2 className="text-8xl font-black tracking-tighter mb-4 text-white uppercase italic">RADAR FOLLOW-UP</h2>
      <div className="space-y-6">{followUpLeads.map(lead => (
          <div key={lead.id} className="bg-[#1C1B16] border border-[#2A2922] p-10 flex flex-col md:flex-row items-center gap-12 group transition-all shadow-xl">
             <div className="flex items-center gap-8 min-w-[350px]"><div className="w-20 h-20 bg-[#14130E] border border-zinc-900 flex items-center justify-center text-4xl font-black text-white">{lead.name?.[0]}</div><div><h4 className="text-3xl font-black text-white tracking-widest italic">{lead.name}</h4><p className="text-[10px] text-zinc-600 font-black tracking-[0.5em] mt-3">FOLLOW-UP DESDE: <span className="text-white">{formatTimeElapsed(lead.status_changed_at)}</span></p></div></div>
             <div className="flex-1 flex gap-2">{phases.map((phase, i) => (<button key={i} onClick={() => updateFollowUpPhase(lead.id, i + 1)} className={`flex-1 py-6 border transition-all text-[10px] font-black tracking-widest ${ (lead.follow_up_phase || 0) >= i + 1 ? 'bg-white text-black border-white' : 'bg-transparent border-[#2A2922] text-zinc-800 hover:text-white' }`}>{ (lead.follow_up_phase || 0) > i + 1 ? <CheckCircle2 size={16} className="mx-auto" /> : <span>{i + 1} {phase.title}</span> }</button>))}</div>
             <div className="flex gap-4"><button onClick={() => updateLeadStatus(lead.id, 'compareceu')} className="bg-white text-black p-5 hover:bg-zinc-200 transition-all"><UserCheck size={20} /></button><button onClick={() => { if(confirm('Remover?')) deleteLead(lead.id) }} className="bg-black text-zinc-800 p-5 border border-zinc-900 hover:text-red-500 transition-all"><Trash2 size={20} /></button></div>
          </div>
        ))}{followUpLeads.length === 0 && <div className="py-40 text-center text-[11px] font-black uppercase text-zinc-900 tracking-[1em]">RADAR SINCRONIZADO.</div>}</div>
    </div>
  )
}

// App Root
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
        <Routes><Route path="/" element={<Dashboard />} /><Route path="/leads" element={<Leads />} /><Route path="/kanban" element={<Kanban />} /><Route path="/follow-up" element={<FollowUp />} /><Route path="/appointments" element={<Agenda />} /><Route path="*" element={<Dashboard />} /></Routes>
      </AuthGuard></Router>
  )
}
export default App
