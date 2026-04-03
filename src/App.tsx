import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LayoutDashboard, Users, Columns, MessageSquare, Calendar as CalendarIcon, Settings as SettingsIcon, LogOut, Plus, Search, Filter, TrendingUp, DollarSign, UserCheck, Globe, Smartphone, Sparkles, Sun, Moon, ThumbsUp, ThumbsDown, Trash2, Clock, CheckCircle2, ChevronRight, X, Flame, AlertCircle, Briefcase, Calendar, User, Mail, Tag, Phone, ShieldCheck, ListTodo, MoreVertical, Edit2, Crown, Trophy, Target, CheckSquare } from 'lucide-react'
import { useLeads, Lead } from './hooks/useLeads'
import { useTasks, Task } from './hooks/useTasks'
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
  if (loading) return <div className="h-screen bg-[#1E1E24] flex items-center justify-center font-bold uppercase text-xs tracking-widest text-brand-purple animate-pulse">Sincronizando HQ...</div>
  if (!session) return <Login />
  return <Layout profile={profile} onSignOut={onSignOut}>{children}</Layout>
}

// Layout Component (Fixed Sidebar Architecture - Linear Edition)
// Layout Component (Professional Anthracite Edition)
const Layout = ({ children, profile, onSignOut }: { children: React.ReactNode, profile: any, onSignOut: () => void }) => {
  const location = useLocation();
  const isAdmin = profile?.role === 'admin';

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Painel', path: '/' },
    ...(isAdmin ? [
      { icon: <ShieldCheck size={18} />, label: 'Central CEO', path: '/admin' },
      { icon: <Target size={18} />, label: 'Gestão Elite', path: '/admin/management' }
    ] : []),
    { icon: <Users size={18} />, label: 'Ecossistema', path: '/leads' },
    { icon: <Columns size={18} />, label: 'Pipeline', path: '/kanban' },
    { icon: <MessageSquare size={18} />, label: 'Follow-Up', path: '/follow-up' },
    { icon: <ListTodo size={18} />, label: 'Tarefas', path: '/tasks' },
    { icon: <CalendarIcon size={18} />, label: 'Agenda', path: '/appointments' },
    { icon: <SettingsIcon size={18} />, label: 'Ajustes', path: '/settings' },
  ]

  return (
    <div className="flex min-h-screen font-outfit bg-[#1E1E24] text-white selection:bg-brand-purple/30">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 fixed left-0 top-0 h-screen border-r border-[#363645] bg-[#1E1E24] flex flex-col z-50 transition-all duration-300">
        <div className="p-8 border-b border-[#363645] mb-8">
           <img src="https://github.com/legendragon03453-dot/FILIPPO-SITE/blob/main/U.webp?raw=true" alt="UNICO" className="w-10 h-auto brightness-200 mx-auto lg:mx-0" />
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-4 px-4 py-4 rounded-luxury transition-all duration-300 group ${location.pathname === item.path ? 'bg-linear-luxury text-white shadow-lg shadow-brand-purple/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="hidden lg:block text-[11px] font-bold tracking-widest italic uppercase">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-6 border-t border-[#363645]">
           <button onClick={onSignOut} className="flex items-center gap-4 px-4 py-4 w-full text-zinc-500 hover:text-brand-pink transition-all group rounded-luxury">
             <LogOut size={18} />
             <span className="hidden lg:block text-[11px] font-bold tracking-widest uppercase italic">Desconectar HQ</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 lg:ml-64 transition-all duration-300">
        {/* Global Header */}
        <header className="sticky top-0 h-24 border-b border-[#363645] bg-[#1E1E24]/90 backdrop-blur-md z-40 flex items-center justify-between px-12">
          <div className="flex items-center gap-4">
            <div className="h-[2px] w-8 bg-linear-luxury"></div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.5em] italic">Comando Studio Ativo</p>
          </div>
          
          <div className="flex items-center gap-8">
            <button className="relative p-3 text-zinc-400 hover:text-white transition-all bg-[#2A2A35] rounded-luxury border border-[#363645]">
               <Sparkles size={18} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-brand-pink rounded-full shadow-lg shadow-brand-pink/50"></span>
            </button>
            <div className="flex items-center gap-4 pl-8 border-l border-[#363645]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-white uppercase tracking-tighter italic">{profile?.full_name}</p>
                <p className="text-[10px] font-black text-brand-pink uppercase tracking-widest leading-none mt-1">{profile?.role?.toUpperCase()} STUDIO</p>
              </div>
              <div className="w-12 h-12 bg-linear-luxury rounded-luxury flex items-center justify-center font-black text-white italic shadow-lg">
                {profile?.full_name?.[0]}
              </div>
            </div>
          </div>
        </header>

        <div className="p-12 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

// Temperature Badge Component
const TempBadge = ({ temp }: { temp?: string }) => {
  const colors = { 'frio': 'border-blue-500/20 text-blue-400 bg-blue-500/5', 'morno': 'border-orange-500/20 text-orange-400 bg-orange-500/5', 'quente': 'border-red-500/20 text-red-400 bg-red-500/5' }
  return (<span className={`text-[9px] font-black uppercase px-3 py-1 border tracking-widest ${colors[temp as keyof typeof colors] || colors.frio}`}>{temp || 'FRIO'}</span>)
}

// Meeting Scheduler Modal
const ScheduleModal = ({ lead, onClose, onSave }: { lead: Lead, onClose: () => void, onSave: (date: string, time: string) => void }) => {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  return (
     <div className="fixed inset-0 bg-[#1E1E24]/95 backdrop-blur-3xl flex items-center justify-center p-4 z-[300] animate-in fade-in transition-all">
       <div className="w-full max-w-md bg-[#2A2A35] border border-[#363645] p-12 rounded-luxury space-y-10 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-linear-luxury"></div>
         <div className="space-y-4">
           <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Agendamento Elite</h3>
           <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">REUNIÃO ESTRATÉGICA: {lead.name}</p>
         </div>
         <div className="space-y-6">
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Data do Encontro</label>
             <input type="date" className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-luxury text-white text-xs font-bold outline-none focus:border-brand-purple transition-all uppercase" value={date} onChange={e => setDate(e.target.value)} />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Horário Exclusivo</label>
             <input type="time" className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-luxury text-white text-xs font-bold outline-none focus:border-brand-purple transition-all" value={time} onChange={e => setTime(e.target.value)} />
           </div>
         </div>
         <div className="flex gap-4 pt-4">
           <button onClick={onClose} className="flex-1 py-5 text-[10px] font-black text-zinc-500 hover:text-white transition-all uppercase rounded-luxury border border-[#363645]">Cancelar</button>
           <button onClick={() => onSave(date, time)} className="flex-[2] py-5 bg-linear-luxury text-white rounded-luxury text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95">Confirmar Agenda</button>
         </div>
       </div>
     </div>
  )
}// --- ADMIN DASHBOARD (OPERATOR MONITOR) ---
const AdminDashboard = ({ onlineUsers }: { onlineUsers: any }) => {
  const [employees, setEmployees] = useState<any[]>([])
  const { tasks, addTask } = useTasks()
  const [selectedEmp, setSelectedEmp] = useState<any>(null)
  const [taskTitle, setTaskTitle] = useState('')

  useEffect(() => { fetchEmployees() }, [])
  const fetchEmployees = async () => { const { data } = await supabase.from('profiles').select('*'); setEmployees(data || []) }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmp || !taskTitle) return
    await addTask({ title: taskTitle.toUpperCase(), assigned_to: selectedEmp.id, status: 'pending' })
    setTaskTitle(''); setSelectedEmp(null); alert('Ordem Enviada.');
  }

  return (
    <div className="space-y-12 animate-fade-in-up">
       <div className="space-y-2">
         <h2 className="text-5xl font-black tracking-tighter text-white italic uppercase leading-none">RADAR DE OPERADORES</h2>
         <div className="flex items-center gap-4">
           <div className="h-[2px] w-12 bg-linear-luxury"></div>
           <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">MONITORAMENTO EM TEMPO REAL</p>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {Object.entries(onlineUsers || {}).map(([id, presence]: any) => (
           <div key={id} className="bg-[#2A2A35] border border-[#363645] p-6 rounded-luxury flex items-center justify-between group hover:border-brand-purple transition-all shadow-xl">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-linear-luxury rounded-luxury flex items-center justify-center text-white font-black italic text-sm">
                 {presence[0]?.full_name?.[0] || 'A'}
               </div>
               <div>
                 <p className="text-xs font-black text-white uppercase italic">{presence[0]?.full_name || 'AGENTE'}</p>
                 <p className="text-[8px] text-brand-pink font-bold uppercase tracking-widest mt-1">HQ: {presence[0]?.current_page || 'SISTEMA'}</p>
               </div>
             </div>
             <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_10px_#10B981]"></div>
           </div>
         ))}
       </div>

       <div className="bg-[#2A2A35] border border-[#363645] rounded-luxury overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1E1E24]">
              <tr>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#363645]">Operador / Tag</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#363645] text-center">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363645]">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#1E1E24] border border-[#363645] rounded-luxury flex items-center justify-center text-white font-black italic shadow-inner">{emp.full_name?.[0]}</div>
                      <div>
                        <p className="text-sm font-bold text-white uppercase italic">{emp.full_name}</p>
                        <p className="text-[8px] text-brand-pink font-black uppercase tracking-widest mt-1 italic">{emp.role?.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button onClick={() => setSelectedEmp(emp)} className="inline-flex items-center gap-2 px-4 py-2 bg-linear-luxury text-white rounded-luxury text-[9px] font-bold tracking-widest uppercase shadow-lg transition-transform active:scale-95">
                      <Plus size={12} /> Despachar Missão
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
       </div>

       {selectedEmp && (
          <div className="fixed inset-0 bg-[#1E1E24]/90 backdrop-blur-md flex items-center justify-center p-4 z-[500]">
             <form onSubmit={handleAddTask} className="w-full max-w-sm bg-[#2A2A35] border border-[#363645] p-10 rounded-luxury space-y-8 shadow-2xl relative">
                <div className="space-y-4">
                   <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Ordem para {selectedEmp.full_name}</h3>
                </div>
                <input required className="w-full bg-[#1E1E24] border border-[#363645] p-4 rounded-luxury text-white text-xs font-bold outline-none focus:border-brand-purple transition-all uppercase placeholder:text-zinc-800" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Diretriz da Task..." />
                <div className="flex gap-4">
                   <button type="button" onClick={() => setSelectedEmp(null)} className="flex-1 py-4 text-[10px] font-black text-zinc-500 uppercase">Cancelar</button>
                   <button type="submit" className="flex-[2] py-4 bg-linear-luxury text-white rounded-luxury text-[10px] font-black uppercase tracking-widest shadow-xl">Enviar</button>
                </div>
             </form>
          </div>
       )}
    </div>
  )
}

// --- ADMIN MANAGEMENT (TEAM CONTROL) ---
const AdminManagement = () => {
  const [employees, setEmployees] = useState<any[]>([])
  const [editEmp, setEditEmp] = useState<any>(null)

  const fetchEmployees = async () => { const { data } = await supabase.from('profiles').select('*').order('full_name'); setEmployees(data || []) }
  useEffect(() => { fetchEmployees() }, [])

  const handleUpdateEmp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editEmp) return
    const { error } = await supabase.from('profiles').update({
       role: editEmp.role,
       tag: editEmp.tag,
       points_pos: editEmp.points_pos.split(',').map((s: string) => s.trim()).filter(Boolean),
       points_neg: editEmp.points_neg.split(',').map((s: string) => s.trim()).filter(Boolean)
    }).eq('id', editEmp.id)
    if (!error) { setEditEmp(null); fetchEmployees(); alert('Hierarquia Atualizada.'); }
  }

  return (
    <div className="space-y-12 animate-fade-in-up">
       <div className="space-y-2">
         <h2 className="text-5xl font-black tracking-tighter text-white italic uppercase leading-none">GESTÃO DE ELITE</h2>
         <div className="flex items-center gap-4">
           <div className="h-[2px] w-12 bg-brand-pink"></div>
           <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">PARAMETRIZAÇÃO DE PERFIS</p>
         </div>
       </div>

       <div className="bg-[#2A2A35] border border-[#363645] rounded-luxury overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-[#363645]">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-linear-luxury rounded-luxury flex items-center justify-center text-white font-black italic shadow-lg">{emp.full_name?.[0]}</div>
                      <div><p className="text-md font-bold text-white uppercase italic">{emp.full_name}</p><p className="text-[9px] text-zinc-500 font-bold tracking-widest">{emp.role?.toUpperCase()}</p></div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => setEditEmp({ ...emp, points_pos: emp.points_pos?.join(', ') || '', points_neg: emp.points_neg?.join(', ') || '' })} className="p-3 bg-[#1E1E24] border border-[#363645] rounded-luxury text-zinc-500 hover:text-white transition-all"><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
       </div>

       {editEmp && (
          <div className="fixed inset-0 bg-[#1E1E24]/95 backdrop-blur-3xl flex items-center justify-center p-4 z-[500] animate-in fade-in transition-all">
             <form onSubmit={handleUpdateEmp} className="w-full max-w-lg bg-[#2A2A35] border border-[#363645] p-10 rounded-luxury space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-pink"></div>
                <div className="flex justify-between items-start"><h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Ajustar Atribuições</h3><button type="button" onClick={() => setEditEmp(null)} className="p-2 text-zinc-500 hover:text-white transition-all"><X size={20} /></button></div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2"><label className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase">Cargo Studio</label><input className="w-full bg-[#1E1E24] border border-[#363645] p-4 rounded-luxury text-white font-bold text-xs outline-none focus:border-brand-purple transition-all uppercase" value={editEmp.role} onChange={e => setEditEmp({...editEmp, role: e.target.value})} /></div>
                   <div className="space-y-2"><label className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase">Tag</label><input className="w-full bg-[#1E1E24] border border-[#363645] p-4 rounded-luxury text-white font-bold text-xs outline-none focus:border-brand-purple transition-all uppercase" value={editEmp.tag} onChange={e => setEditEmp({...editEmp, tag: e.target.value})} /></div>
                   <div className="col-span-2 space-y-2"><label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Pontos Fortes</label><input className="w-full bg-[#1E1E24] border border-[#363645] p-4 rounded-luxury text-white font-bold text-xs outline-none focus:border-brand-purple transition-all uppercase" value={editEmp.points_pos} onChange={e => setEditEmp({...editEmp, points_pos: e.target.value})} /></div>
                   <div className="col-span-2 space-y-2"><label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">A Melhorar</label><input className="w-full bg-[#1E1E24] border border-[#363645] p-4 rounded-luxury text-white font-bold text-xs outline-none focus:border-brand-purple transition-all uppercase" value={editEmp.points_neg} onChange={e => setEditEmp({...editEmp, points_neg: e.target.value})} /></div>
                </div>
                <button type="submit" className="w-full py-5 bg-linear-luxury text-white rounded-luxury font-black text-[10px] tracking-widest uppercase shadow-xl transition-all active:scale-95">Sincronizar HQ</button>
             </form>
          </div>
       )}
    </div>
  )
}

// --- TASKS PAGE (EMPLOYEE VIEW) ---
const Tasks = ({ profile }: { profile: any }) => {
  const { tasks, updateTaskStatus } = useTasks(profile?.id)
  const handleSave = async (id: string, currentStatus: string) => { await updateTaskStatus(id, currentStatus === 'completed' ? 'pending' : 'completed'); alert('Status Sincronizado com HQ.') }
  return (
    <div className="space-y-12 animate-fade-in-up">
       <div className="flex items-center justify-between">
         <div className="space-y-2">
           <h2 className="text-5xl font-black tracking-tighter text-white italic uppercase leading-none">PULSO DE EXECUÇÃO</h2>
           <div className="flex items-center gap-4">
             <div className="h-[2px] w-12 bg-linear-luxury"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">SUAS DIRETRIZES OPERACIONAIS</p>
           </div>
         </div>
       </div>

       <div className="grid grid-cols-1 gap-6">
         {tasks.map(task => (
           <div key={task.id} className="bg-[#2A2A35] border border-[#363645] p-8 rounded-luxury flex flex-col md:flex-row items-center gap-8 group hover:border-brand-purple transition-all duration-300 shadow-xl">
             <div className="flex items-center gap-6 flex-1">
               <div className="w-16 h-16 bg-[#1E1E24] border border-[#363645] rounded-luxury flex items-center justify-center text-brand-purple group-hover:scale-110 transition-transform shadow-inner">
                 <ListTodo size={28} />
               </div>
               <div>
                 <h4 className={`text-2xl font-black tracking-tight italic uppercase transition-all ${task.status === 'completed' ? 'text-zinc-600 line-through' : 'text-white'}`}>{task.title}</h4>
                 <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-1 uppercase italic">ORDEM ATRIBUÍDA PELA HQ</p>
               </div>
             </div>
             <div className="flex items-center gap-6">
                <button 
                  onClick={() => handleSave(task.id, task.status)} 
                  className={`px-10 py-5 rounded-luxury text-[10px] font-bold uppercase tracking-widest transition-all ${task.status === 'completed' ? 'bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]' : 'bg-linear-luxury text-white hover:brightness-110 shadow-lg active:scale-95'}`}
                >
                  {task.status === 'completed' ? '✓ Concluída' : 'Executar Missão'}
                </button>
             </div>
           </div>
         ))}
          {tasks.length === 0 && (
            <div className="py-40 text-center opacity-40">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[1em]">SEM ORDENS DE SERVIÇO PENDENTES.</p>
            </div>
          )}
        </div>
     </div>
  )
}

// Dashboard with Role-Specific metrics
const DashboardUnified = ({ profile }: { profile: any }) => {
  const { leads, loading } = useLeads()
  const { tasks } = useTasks(profile?.id)
  const stats = [
    { label: 'Pipeline Ativo', value: leads.length, icon: <Users size={18} /> },
    { label: 'Studio Total Vendas', value: leads.filter(l => l.status === 'vendido').length, icon: <Trophy size={18} /> },
    { label: 'Equity Estimado', value: `R$ ${(leads.reduce((acc, curr) => acc + (Number(curr.faturamento_estimado) || 0), 0) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <DollarSign size={18} /> },
    { label: 'Seus Fechamentos', value: leads.filter(l => l.owner_id === profile?.id && l.status === 'vendido').length, icon: <Target size={18} /> },
    { label: 'Seus Agendamentos', value: leads.filter(l => l.owner_id === profile?.id && l.status === 'agendamento').length, icon: <CalendarIcon size={18} /> },
    { label: 'Opportunities IA', value: leads.filter(l => (l.ai_score || 0) > 80).length, icon: <Sparkles size={18} /> }
  ]
  if (loading) return <div className="text-zinc-500 flex items-center justify-center min-h-[50vh] font-bold uppercase animate-pulse text-xs tracking-widest">Sincronizando Studio...</div>
  return (
    <div className="space-y-12 animate-fade-in-up">
      <div className="flex items-center justify-between">
         <h2 className="text-6xl font-black tracking-tighter text-white italic uppercase">PORTAL STUDIO</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#2A2A35] border border-[#363645] p-10 rounded-luxury flex flex-col gap-10 hover:border-brand-purple transition-all duration-300 shadow-xl group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="p-4 bg-[#1E1E24] text-brand-purple rounded-luxury group-hover:scale-110 transition-all border border-[#363645]">{stat.icon}</span>
              <div className="w-2 h-2 bg-brand-pink rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 tracking-widest mb-2 uppercase">{stat.label}</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 bg-[#2A2A35] border border-[#363645] p-12 rounded-luxury shadow-xl space-y-12">
            <h3 className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 border-b border-[#363645] pb-6 uppercase">Sua Performance: {profile?.full_name}</h3>
            <div className="space-y-10">
               <div className="space-y-6">
                  <p className="text-[10px] font-black text-white flex items-center gap-3 uppercase tracking-widest"><ThumbsUp size={14} className="text-[#10B981]" /> Pontos Fortes</p>
                  <div className="flex flex-wrap gap-2">
                    {(profile?.points_pos || ['Agilidade', 'Execução']).map((p: any, i: number) => (
                       <span key={i} className="text-[9px] bg-brand-purple/10 border border-brand-purple/20 text-brand-purple px-4 py-2 rounded-lg font-black italic uppercase">{p}</span>
                    ))}
                  </div>
               </div>
               <div className="space-y-6">
                  <p className="text-[10px] font-black text-white flex items-center gap-3 uppercase tracking-widest"><ThumbsDown size={14} className="text-brand-pink" /> A Melhorar</p>
                  <div className="flex flex-wrap gap-2">
                    {(profile?.points_neg || ['Pontualidade']).map((p: any, i: number) => (
                       <span key={i} className="text-[9px] bg-brand-pink/10 border border-brand-pink/20 text-brand-pink px-4 py-2 rounded-lg font-black italic uppercase">{p}</span>
                    ))}
                  </div>
               </div>
            </div>
        </div>
        <div className="lg:col-span-2 bg-[#2A2A35] border border-[#363645] p-12 rounded-luxury shadow-xl flex flex-col">
            <h3 className="text-[10px] font-bold border-b border-[#363645] pb-6 mb-10 text-zinc-500 tracking-widest uppercase italic">Últimas Atividades do Operador</h3>
            <div className="space-y-4 flex-1">
               {leads.filter(l => l.owner_id === profile.id).slice(0, 6).map(lead => (
                 <div key={lead.id} className="flex items-center gap-8 p-6 bg-[#1E1E24] border border-[#363645] rounded-luxury hover:border-brand-purple transition-all group">
                    <div className="w-12 h-12 bg-[#2A2A35] rounded-lg flex items-center justify-center text-white font-black italic text-lg">{lead.name?.[0]}</div>
                    <div className="flex-1 truncate">
                       <p className="text-lg font-bold text-white italic truncate uppercase">{lead.name}</p>
                       <p className="text-[9px] text-brand-pink font-black tracking-widest mt-1 uppercase leading-none">{lead.status?.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-white italic tracking-tighter">{lead.ai_score || 0}% IA</p>
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
  const { leads, loading, addLead, deleteLead } = useLeads()
  const [profile, setProfile] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  useEffect(() => { supabase.auth.getUser().then(({ data: { user } }) => { if (user) supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data)) }) }, [])
  const handleAddLead = async (leadData: any) => {
    setIsAnalyzing(true)
    try {
      const analysis = await analyzeLead(leadData)
      await addLead({ ...leadData, owner_id: profile?.id, registered_by_name: profile?.full_name, ai_score: analysis.score_potencial, ai_tags: analysis.tags_ai, ai_summary: analysis.ai_summary })
    } catch (err) { await addLead({ ...leadData, owner_id: profile?.id, registered_by_name: profile?.full_name }) }
    finally { setIsAnalyzing(false); setIsModalOpen(false); }
  }
  if (loading) return <div className="text-zinc-500 flex items-center justify-center min-h-[50vh] font-bold uppercase animate-pulse">Sincronizando Ecossistema...</div>
  return (
    <div className="space-y-12 animate-fade-in-up">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
         <div className="space-y-2">
           <h2 className="text-5xl font-black tracking-tighter text-white italic uppercase leading-none">ECOSSISTEMA</h2>
           <div className="flex items-center gap-4">
             <div className="h-[2px] w-12 bg-linear-luxury"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">GESTOR DE ATIVOS LINEAR</p>
           </div>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="bg-linear-luxury text-white px-10 py-5 rounded-luxury font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-4 shadow-xl active:scale-95 group">
           <Plus size={18} className="group-hover:rotate-90 transition-transform" />
           <span>Cadastrar Lead Elite</span>
         </button>
       </div>

       <div className="bg-[#2A2A35] border border-[#363645] rounded-luxury overflow-hidden shadow-2xl">

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1E1E24]">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#363645]">Disciplina / Nome</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#363645] text-center">IA Score</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#363645]">Investimento</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#363645]">Estágio</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#363645] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#363645]">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-[#2A2A35] border border-[#363645] rounded-luxury flex items-center justify-center text-white font-black italic text-lg shadow-inner group-hover:scale-110 transition-transform">{lead.name?.[0]}</div>
                          <div>
                             <p className="text-lg font-bold text-white italic truncate max-w-[200px] uppercase leading-none">{lead.name}</p>
                             <p className="text-[9px] text-zinc-500 font-bold tracking-widest mt-2 uppercase italic">{lead.product_type || 'ESTRATÉGIA'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-center text-[10px] font-black text-brand-pink italic">{lead.ai_score || 0}% POTENCIAL</td>
                    <td className="px-10 py-8 text-white font-black text-lg italic tracking-tighter">R$ {(Number(lead.faturamento_estimado || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-10 py-8">
                       <span className="px-3 py-1 bg-[#1E1E24] border border-[#363645] rounded text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">{lead.status?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex items-center justify-end gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { if(confirm('Remover Lead Permanente?')) deleteLead(lead.id) }} className="text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                          <button className="text-zinc-500 hover:text-brand-purple transition-colors"><ChevronRight size={18} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       </div>
       {isModalOpen && <AddLeadModal profile={profile} onClose={() => setIsModalOpen(false)} onAdd={handleAddLead} />}
       {isAnalyzing && (
         <div className="fixed inset-0 bg-[#1E1E24]/95 backdrop-blur-md flex flex-col items-center justify-center z-[200] animate-in fade-in">
           <div className="w-20 h-20 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mb-8"></div>
           <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter animate-pulse">IA Qualificando Dados...</h3>
         </div>
       )}
    </div>
  )
}

const Kanban = () => {
  const { leads, loading, updateLeadStatus, updateMeetingSchedule, deleteLead } = useLeads()
  const [schedulingLead, setSchedulingLead] = useState<Lead | null>(null)
  const columns = [
    { id: 'novo_lead', label: 'NOVO LEAD / INBOX' }, 
    { id: 'iniciou_atendimento', label: 'INICIOU ATENDIMENTO' }, 
    { id: 'conversando', label: 'CONVERSANDO' }, 
    { id: 'aguardando_resposta', label: 'AGUARDANDO' }, 
    { id: 'follow_up', label: 'FOLLOW UP' }, 
    { id: 'agendamento', label: 'REUNIÃO' }, 
    { id: 'compareceu', label: 'COMPARECEU' }, 
    { id: 'vendido', label: 'VENDIDO' }, 
    { id: 'perdido', label: 'PERDIDO' }
  ]
  
  const onDragEnd = (result: any) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    const lead = leads.find(l => l.id === draggableId)
    if (!lead) return
    if (destination.droppableId === 'agendamento' && lead.status !== 'agendamento') setSchedulingLead(lead)
    else updateLeadStatus(draggableId, destination.droppableId)
  }

  if (loading) return <div className="text-zinc-500 flex items-center justify-center min-h-[50vh] font-bold uppercase animate-pulse">Sincronizando Pipeline...</div>

  return (
    <div className="space-y-12 animate-fade-in-up h-full">
      <div className="space-y-2">
           <h2 className="text-5xl font-black tracking-tighter text-white italic uppercase leading-none">PIPELINE LINEAR</h2>
           <div className="flex items-center gap-4">
             <div className="h-[2px] w-12 bg-linear-luxury"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">GESTÃO DE FLUXO ESTRATÉGICO</p>
           </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-8 overflow-x-auto pb-12 custom-scrollbar px-1 min-h-[800px] items-start">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided: DroppableProvided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex-shrink-0 w-[400px] flex flex-col gap-6 bg-[#2A2A35]/30 border border-[#363645] p-6 rounded-luxury relative transition-all min-h-[150px]">
                  <div className="flex items-center justify-between border-b border-[#363645] pb-6 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-5 bg-linear-luxury rounded-full"></div>
                      <h3 className="font-black text-white uppercase text-[10px] tracking-widest leading-none">{column.label}</h3>
                    </div>
                    <span className="text-[9px] font-black text-zinc-500 bg-[#1E1E24] px-2 py-1 rounded border border-[#363645]">{leads.filter(l => l.status === column.id).length}</span>
                  </div>
                  
                  <div className="space-y-6">
                    {leads.filter(l => l.status === column.id).map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-[#2A2A35] border border-[#363645] p-8 rounded-luxury transition-all duration-300 relative group shadow-xl ${snapshot.isDragging ? 'rotate-2 scale-105 border-brand-purple z-50 shadow-brand-purple/20' : 'hover:border-brand-purple'}`}>
                             <div className="flex justify-between items-start mb-6">
                               <div className="flex-1">
                                 <div className="flex gap-2 mb-4">
                                   <TempBadge temp={lead.temperature} />
                                   {lead.status === 'vendido' && <span className="text-[9px] font-black bg-[#10B981] text-white px-3 py-1 rounded italic uppercase tracking-tighter">Equity Fechado</span>}
                                 </div>
                                 <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-brand-purple transition-all italic truncate uppercase">{lead.name}</h4>
                               </div>
                               <div className="flex flex-col items-end gap-2">
                                  <span className="text-[9px] font-black py-1 px-3 bg-[#1E1E24] text-brand-pink rounded border border-[#363645] italic">{lead.ai_score || 0}% IA</span>
                               </div>
                             </div>
                             
                             <div className="space-y-4 mb-8">
                               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-3"><Briefcase size={12} className="text-brand-purple" /> {lead.product_type || 'ESTRATÉGIA'}</p>
                               <p className="text-2xl text-white font-black tracking-tighter italic">R$ {(Number(lead.faturamento_estimado || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                             </div>
                             
                             <div className="border-t border-[#363645] pt-6 flex justify-between items-center">
                               <div>
                                 <p className="text-[8px] text-zinc-600 font-bold uppercase mb-1">Operador Responsável</p>
                                 <p className="text-[10px] text-zinc-400 font-black italic truncate max-w-[150px] uppercase">{lead.registered_by_name || 'AGENTE STUDIO'}</p>
                               </div>
                               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                 <button onClick={() => deleteLead(lead.id)} className="p-3 bg-[#1E1E24] rounded-luxury text-zinc-600 hover:text-red-400 transition-colors border border-[#363645]"><Trash2 size={16} /></button>
                                 <button className="p-3 bg-[#1E1E24] rounded-luxury text-zinc-600 hover:text-brand-purple transition-colors border border-[#363645]"><ChevronRight size={16} /></button>
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
      {schedulingLead && <ScheduleModal lead={schedulingLead} onClose={() => setSchedulingLead(null)} onSave={(date: string, time: string) => { updateMeetingSchedule(schedulingLead.id, date, time); setSchedulingLead(null); }} />}
    </div>
  )
}

const FollowUp = () => {
  const { leads, loading, updateLeadStatus, updateFollowUpPhase, deleteLead } = useLeads()
  const followUpLeads = leads.filter(l => l.status === 'follow_up')
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, [])
  const phases = [{ title: 'CONEXÃO', desc: '' }, { title: 'VALOR', desc: '' }, { title: 'OFERTA', desc: '' }]
  if (loading) return <div className="text-zinc-500 flex items-center justify-center min-h-[50vh] font-bold uppercase animate-pulse">Sincronizando Radar...</div>
  return (
    <div className="space-y-12 animate-fade-in-up">
      <div className="space-y-2">
           <h2 className="text-5xl font-black tracking-tighter text-white italic uppercase leading-none">RADAR FOLLOW-UP</h2>
           <div className="flex items-center gap-4">
             <div className="h-[2px] w-12 bg-brand-pink"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">MONITORAMENTO DE RELACIONAMENTO</p>
           </div>
      </div>

      <div className="space-y-6">
        {followUpLeads.map(lead => (
          <div key={lead.id} className="bg-[#2A2A35] border border-[#363645] p-10 rounded-luxury flex flex-col lg:flex-row items-center gap-12 group transition-all duration-300 shadow-xl hover:border-brand-purple">
             <div className="flex items-center gap-8 min-w-[350px]">
                <div className="w-20 h-20 bg-[#1E1E24] border border-[#363645] rounded-luxury flex items-center justify-center text-2xl font-black text-white italic shadow-inner group-hover:scale-110 transition-transform">{lead.name?.[0]}</div>
                <div>
                   <h4 className="text-2xl font-black text-white tracking-tight italic uppercase">{lead.name}</h4>
                   <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-3 uppercase italic leading-none">Ativo desde: <span className="text-brand-purple">{formatTimeElapsed(lead.status_changed_at)}</span></p>
                </div>
             </div>
             <div className="flex-1 w-full grid grid-cols-3 gap-3">
                {phases.map((phase, i) => (
                  <button 
                    key={i} 
                    onClick={() => updateFollowUpPhase(lead.id, i + 1)} 
                    className={`py-6 rounded-luxury border transition-all text-[9px] font-black tracking-widest uppercase italic shadow-md active:scale-95 ${ (lead.follow_up_phase || 0) >= i + 1 ? 'bg-linear-luxury text-white border-brand-purple' : 'bg-[#1E1E24] border-[#363645] text-zinc-600 hover:text-white' }`}
                  >
                    { (lead.follow_up_phase || 0) > i + 1 ? <CheckCircle2 size={16} className="mx-auto" /> : <span>{i + 1}. {phase.title}</span> }
                  </button>
                ))}
             </div>
             <div className="flex gap-4">
                <button onClick={() => updateLeadStatus(lead.id, 'compareceu')} className="p-5 bg-linear-luxury text-white rounded-luxury hover:brightness-110 transition-all shadow-xl active:scale-95"><UserCheck size={22} /></button>
                <button onClick={() => { if(confirm('Remover?')) deleteLead(lead.id) }} className="p-5 bg-[#1E1E24] text-zinc-500 rounded-luxury border border-[#363645] hover:text-red-400 hover:border-red-400 transition-all active:scale-95"><Trash2 size={22} /></button>
             </div>
          </div>
        ))}
        {followUpLeads.length === 0 && (
          <div className="py-40 text-center opacity-40">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[1em]">RADAR SINCRONIZADO.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const Agenda = () => {
  const { leads, loading } = useLeads()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const meetings = leads.filter(l => l.meeting_date)
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(currentMonth)), end: endOfWeek(endOfMonth(currentMonth)) })
  
  if (loading) return <div className="text-zinc-500 flex items-center justify-center min-h-[50vh] font-bold uppercase animate-pulse">Sincronizando Agenda...</div>

  return (
    <div className="space-y-12 animate-fade-in-up">
       <div className="flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="space-y-2">
           <h2 className="text-5xl font-black tracking-tighter text-white italic uppercase leading-none">AGENDA STUDIO</h2>
           <div className="flex items-center gap-4">
             <div className="h-[2px] w-12 bg-linear-luxury"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">SINCRONIZAÇÃO DE ATENDIMENTOS</p>
           </div>
         </div>
         <div className="flex items-center gap-8 bg-[#2A2A35] border border-[#363645] p-4 rounded-luxury text-white font-bold text-xs tracking-widest italic uppercase shadow-xl">
           <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:text-brand-purple transition-colors"><ChevronRight size={22} className="rotate-180" /></button>
           <span className="min-w-[150px] text-center">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
           <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:text-brand-purple transition-colors"><ChevronRight size={22} /></button>
         </div>
       </div>

       <div className="bg-[#2A2A35] border border-[#363645] rounded-luxury overflow-hidden shadow-2xl">
          <div className="grid grid-cols-7 bg-[#1E1E24]/50 border-b border-[#363645]">
            {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(d => (
              <div key={d} className="p-6 text-center text-[10px] font-bold text-zinc-500 tracking-[0.5em] uppercase italic">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day: Date, i: number) => {
              const dayMeetings = meetings.filter(m => isSameDay(new Date(m.meeting_date!), day))
              const isToday = isSameDay(day, new Date())
              return (
                <div key={i} className={`min-h-[160px] p-4 border-[#363645] ${i % 7 !== 6 ? 'border-r' : ''} border-b relative transition-colors hover:bg-white/5 ${!isSameMonth(day, currentMonth) ? 'opacity-20 grayscale' : ''}`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-luxury text-[11px] font-bold mb-4 ${isToday ? 'bg-linear-luxury text-white shadow-lg shadow-brand-purple/20' : 'text-zinc-600'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-2">
                    {dayMeetings.map((m, j) => (
                      <div key={j} className="bg-[#1E1E24] border border-[#363645] p-3 rounded-luxury text-[9px] font-bold tracking-tight leading-tight flex flex-col gap-1 border-l-4 border-l-brand-pink shadow-lg group hover:border-l-[#C90EFF] transition-all">
                        <span className="text-brand-pink group-hover:text-brand-purple transition-colors">{m.meeting_time}H</span>
                        <span className="truncate text-white uppercase italic">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
       </div>
     </div>
  )
}

const Settings = ({ profile, onUpdate }: { profile: any, onUpdate: (data: any) => void }) => {
  const [formData, setFormData] = useState<any>(null)
  useEffect(() => { if (profile) setFormData({ ...profile, cargos: profile.cargos?.join(', ') || '', points_pos: profile.points_pos?.join(', ') || '', points_neg: profile.points_neg?.join(', ') || '' }) }, [profile])
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ ...formData, cargos: formData.cargos.split(',').map((s: string) => s.trim()).filter(Boolean), points_pos: formData.points_pos.split(',').map((s: string) => s.trim()).filter(Boolean), points_neg: formData.points_neg.split(',').map((s: string) => s.trim()).filter(Boolean) })
    alert('Ajustes Studio aplicados com sucesso.')
  }
  if (!formData) return <div className="text-zinc-500 flex items-center justify-center min-h-[50vh] font-bold uppercase animate-pulse">Sincronizando Perfil...</div>
  return (
    <div className="space-y-12 animate-fade-in-up">
       <div className="space-y-2">
           <h2 className="text-5xl font-black tracking-tighter text-white italic uppercase leading-none">CONFIGURAÇÕES</h2>
           <div className="flex items-center gap-4">
             <div className="h-[2px] w-12 bg-linear-luxury"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">PARAMETRIZAÇÃO DE OPERADOR</p>
           </div>
       </div>

       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-12">
             <div className="bg-[#2A2A35] border border-[#363645] p-10 rounded-luxury shadow-xl space-y-8">
                <div className="border-b border-[#363645] pb-6 flex items-center gap-4">
                   <User size={20} className="text-brand-purple" />
                   <h3 className="text-sm font-black text-white italic uppercase tracking-widest leading-none">Identidade Studio</h3>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Nome do Operador</label>
                      <input className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-luxury text-white text-sm font-bold outline-none focus:border-brand-purple transition-all" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                   </div>
                   <div className="space-y-2 opacity-50">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Cargo Atual (Via Admin)</label>
                      <div className="w-full bg-transparent border border-[#363645] p-5 rounded-luxury text-zinc-500 text-sm font-bold">{profile?.role?.toUpperCase()}</div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Tag Identificadora</label>
                      <input className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-luxury text-white text-sm font-bold outline-none focus:border-brand-purple transition-all" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} />
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-12">
             <div className="bg-[#2A2A35] border border-[#363645] p-10 rounded-luxury shadow-xl space-y-8">
                <div className="border-b border-[#363645] pb-6 flex items-center gap-4">
                   <Phone size={20} className="text-brand-pink" />
                   <h3 className="text-sm font-black text-white italic uppercase tracking-widest leading-none">Linhas de Contato</h3>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">WhatsApp</label>
                      <input className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-luxury text-white text-sm font-bold outline-none focus:border-brand-purple transition-all" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">WhatsApp Comercial</label>
                      <input className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-luxury text-white text-sm font-bold outline-none focus:border-brand-purple transition-all" value={formData.whatsapp_business} onChange={e => setFormData({...formData, whatsapp_business: e.target.value})} />
                   </div>
                </div>
             </div>
             
             <button type="submit" className="w-full bg-linear-luxury text-white p-8 rounded-luxury font-black text-xs uppercase tracking-[0.3em] hover:brightness-110 transition-all shadow-xl active:scale-95 shadow-brand-purple/20">Salvar Ajustes Studio</button>
          </div>
       </form>
    </div>
  )
}

const AuthenticatedApp = ({ session, profile, loading, onSignOut, handleUpdateProfile }: any) => {
  const [onlineUsers, setOnlineUsers] = useState<any>({})
  const location = useLocation()

  useEffect(() => {
    if (session && profile) {
      const channel = supabase.channel('presence-studio', { config: { presence: { key: profile.id } } })
      channel
        .on('presence', { event: 'sync' }, () => { setOnlineUsers(channel.presenceState()) })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ full_name: profile.full_name, current_page: location.pathname.toUpperCase() })
          }
        })
      return () => { channel.unsubscribe() }
    }
  }, [session, profile, location.pathname])

  return (
    <AuthGuard session={session} profile={profile} loading={loading} onSignOut={onSignOut}>
       <Routes>
         <Route path="/" element={<DashboardUnified profile={profile} />} />
         <Route path="/admin" element={<AdminDashboard onlineUsers={onlineUsers} />} />
         <Route path="/admin/management" element={<AdminManagement />} />
         <Route path="/leads" element={<Leads />} />
         <Route path="/kanban" element={<Kanban />} />
         <Route path="/follow-up" element={<FollowUp />} />
         <Route path="/appointments" element={<Agenda />} />
         <Route path="/tasks" element={<Tasks profile={profile} />} />
         <Route path="/settings" element={<Settings profile={profile} onUpdate={handleUpdateProfile} />} />
         <Route path="*" element={<DashboardUnified profile={profile} />} />
       </Routes>
    </AuthGuard>
  )
}

// App Root
const App = () => {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { 
      setSession(session); 
      if (session) {
        fetchProfile(session.user.id, session.user.email).then(() => setLoading(false)); 
      } else {
        setLoading(false);
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { 
      setSession(session); 
      if (session) fetchProfile(session.user.id, session.user.email); 
      else setProfile(null); 
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string, email?: string) => { 
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      const isCEOEmail = email === 'filippodeisgnerweb@gmail.com' || email === 'filippodesignerweb@gmail.com';
      if (isCEOEmail && data.role !== 'admin') {
        const { data: updated } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId).select().single()
        setProfile(updated || data)
      } else {
        setProfile(data)
      }
    }
  }

  const handleUpdateProfile = async (updatedData: any) => { 
    const { error } = await supabase.from('profiles').update(updatedData).eq('id', profile.id)
    if (!error) fetchProfile(profile.id)
  }

  return (
    <Router>
      <AuthenticatedApp 
        session={session} 
        profile={profile} 
        loading={loading} 
        onSignOut={() => supabase.auth.signOut()} 
        handleUpdateProfile={handleUpdateProfile}
      />
    </Router>
  )
}
export default App
