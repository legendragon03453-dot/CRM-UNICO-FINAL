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
  if (loading) return <div className="h-screen bg-[#1E1E24] flex items-center justify-center font-bold uppercase text-xs tracking-widest text-zinc-500 animate-pulse">Sincronizando HQ...</div>
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
    <div className="flex min-h-screen font-outfit bg-[#1E1E24] text-white selection:bg-[#3B82F6]/30">
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
              className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group ${location.pathname === item.path ? 'bg-[#3B82F6] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="hidden lg:block text-xs font-semibold tracking-wide">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-6 border-t border-[#363645]">
           <button onClick={onSignOut} className="flex items-center gap-4 px-4 py-4 w-full text-zinc-500 hover:text-red-400 transition-all group rounded-xl">
             <LogOut size={18} />
             <span className="hidden lg:block text-xs font-bold tracking-wide">Desconectar</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 lg:ml-64 transition-all duration-300">
        {/* Global Header */}
        <header className="sticky top-0 h-24 border-b border-[#363645] bg-[#1E1E24]/80 backdrop-blur-md z-40 flex items-center justify-between px-12">
          <div className="flex items-center gap-6 bg-[#2A2A35] border border-[#363645] px-6 py-3 rounded-xl w-full max-w-xl group focus-within:border-[#3B82F6] transition-all">
            <Search size={16} className="text-zinc-500 group-focus-within:text-[#3B82F6]" />
            <input placeholder="Pesquisar no sistema..." className="bg-transparent border-none outline-none text-sm font-medium w-full text-white placeholder:text-zinc-600" />
          </div>
          
          <div className="flex items-center gap-8">
            <button className="relative p-3 text-zinc-400 hover:text-white transition-all bg-[#2A2A35] rounded-xl border border-[#363645]">
               <Sparkles size={18} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-[#FB923C] rounded-full"></span>
            </button>
            <div className="flex items-center gap-4 pl-8 border-l border-[#363645]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white uppercase tracking-tighter">{profile?.full_name}</p>
                <p className="text-[10px] font-black text-[#FB923C] uppercase tracking-widest leading-none">{profile?.role}</p>
              </div>
              <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center font-black text-white italic shadow-lg">
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
     <div className="fixed inset-0 bg-[#1E1E24]/90 backdrop-blur-3xl flex items-center justify-center p-4 z-[300] animate-in fade-in transition-all">
       <div className="w-full max-w-md bg-[#2A2A35] border border-[#363645] p-12 rounded-2xl space-y-10 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-[#3B82F6]"></div>
         <div className="space-y-4">
           <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Agendamento Elite</h3>
           <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">REUNIÃO ESTRATÉGICA: {lead.name}</p>
         </div>
         <div className="space-y-6">
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Data do Encontro</label>
             <input type="date" className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-xl text-white text-xs font-bold outline-none focus:border-[#3B82F6] transition-all uppercase" value={date} onChange={e => setDate(e.target.value)} />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Horário Exclusivo</label>
             <input type="time" className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-xl text-white text-xs font-bold outline-none focus:border-[#3B82F6] transition-all" value={time} onChange={e => setTime(e.target.value)} />
           </div>
         </div>
         <div className="flex gap-4 pt-4">
           <button onClick={onClose} className="flex-1 py-5 text-[10px] font-bold text-zinc-500 hover:text-white transition-all uppercase">Cancelar</button>
           <button onClick={() => onSave(date, time)} className="flex-[2] py-5 bg-[#3B82F6] text-white rounded-xl text-[10px] font-bold tracking-widest hover:bg-[#2E5BFF] transition-all shadow-xl uppercase">Confirmar Agenda</button>
         </div>
       </div>
     </div>
  )
}

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ onlineUsers = {} }: { onlineUsers?: any }) => {
  const { leads, loading } = useLeads()
  const { tasks } = useTasks()
  const [employees, setEmployees] = useState<any[]>([])

  useEffect(() => { supabase.from('profiles').select('*').then(({ data }) => setEmployees(data || [])) }, [])

  const salesByOwner = employees.map(emp => {
    const soldLeads = leads.filter(l => l.owner_id === emp.id && l.status === 'vendido')
    const totalVolume = soldLeads.reduce((acc, curr) => acc + (Number(curr.faturamento_estimado) || 0), 0)
    return { ...emp, soldLeads: soldLeads.length, totalVolume }
  }).sort((a, b) => b.totalVolume - a.totalValue)

  const faturamentoTotal = leads.reduce((acc, curr) => acc + (Number(curr.faturamento_estimado) || 0), 0)
  const completedTasks = tasks.filter(t => t.status === 'completed').length

  const stats = [
    { label: 'EQUITY TOTAL', value: `R$ ${faturamentoTotal.toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'text-[#3B82F6]' },
    { label: 'VENDAS REALIZADAS', value: leads.filter(l => l.status === 'vendido').length, icon: <Trophy size={20} />, color: 'text-[#10B981]' },
    { label: 'AGENDAMENTOS GLOBAIS', value: leads.filter(l => l.status === 'agendamento').length, icon: <CalendarIcon size={20} />, color: 'text-[#FB923C]' },
    { label: 'EXECUÇÃO DE TASKS', value: `${completedTasks} / ${tasks.length}`, icon: <CheckSquare size={20} />, color: 'text-zinc-500' }
  ]

  if (loading) return <div className="text-zinc-500 flex items-center justify-center min-h-[50vh] font-bold uppercase animate-pulse">Sincronizando Radar CEO...</div>

  return (
    <div className="space-y-12 animate-fade-in-up">
       <div className="space-y-2">
           <h2 className="text-5xl font-black tracking-tighter text-white italic uppercase leading-none">CENTRAL CEO</h2>
           <div className="flex items-center gap-4">
             <div className="h-[2px] w-12 bg-[#3B82F6]"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">VISÃO ANALÍTICA E ESTRATÉGICA</p>
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-[#2A2A35] border border-[#363645] p-8 rounded-2xl shadow-xl group hover:border-[#3B82F6] transition-all">
               <div className="flex items-center justify-between mb-8">
                  <div className={`p-4 bg-[#1E1E24] rounded-xl border border-[#363645] ${s.color}`}>{s.icon}</div>
                  <div className="w-2 h-2 rounded-full bg-[#FB923C] animate-pulse"></div>
               </div>
               <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase italic mb-2">{s.label}</p>
               <h3 className="text-3xl font-black text-white italic tracking-tighter">{s.value}</h3>
            </div>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-[#2A2A35] border border-[#363645] rounded-3xl p-10 shadow-2xl space-y-10">
                <div className="flex items-center justify-between border-b border-[#363645] pb-8">
                   <h3 className="text-[11px] font-black tracking-widest text-[#3B82F6] uppercase flex items-center gap-3"><Globe size={16} /> Radar de Presença em Tempo Real</h3>
                   <span className="bg-[#1E1E24] text-[9px] font-bold text-zinc-500 px-4 py-2 border border-[#363645] rounded-lg tracking-widest uppercase">Canal CEO Sincronizado</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {employees.map(emp => {
                     const isOnline = !!onlineUsers[emp.id]
                     const state = isOnline ? onlineUsers[emp.id][0] : null
                     return (
                       <div key={emp.id} className={`bg-[#1E1E24] border ${isOnline ? 'border-[#3B82F6] shadow-lg shadow-[#3B82F6]/5' : 'border-[#363645]'} p-6 rounded-2xl flex items-center gap-6 group hover:translate-y-[-2px] transition-all`}>
                          <div className="relative">
                             <div className={`w-14 h-14 ${isOnline ? 'bg-[#2A2A35]' : 'bg-[#2A2A35]/50'} rounded-xl flex items-center justify-center text-white text-xl font-black italic shadow-inner`}>{emp.full_name?.[0]}</div>
                             <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[#1E1E24] ${isOnline ? 'bg-[#10B981]' : 'bg-zinc-700'}`}></div>
                          </div>
                          <div className="flex-1 truncate">
                             <p className="text-lg font-bold text-white italic leading-none truncate">{emp.full_name}</p>
                             <p className="text-[9px] font-black text-[#FB923C] tracking-widest mt-2 uppercase italic">{isOnline ? (state?.current_page || 'NAVEGANDO') : 'OFFLINE'}</p>
                          </div>
                       </div>
                     )
                   })}
                </div>
             </div>
          </div>

          <div className="bg-[#2A2A35] border border-[#363645] rounded-3xl p-10 shadow-2xl space-y-10 flex flex-col">
             <div className="border-b border-[#363645] pb-8">
                <h3 className="text-[11px] font-black tracking-widest text-[#FB923C] uppercase flex items-center gap-3"><Trophy size={16} /> Ranking de Conversão</h3>
             </div>
             <div className="space-y-4 flex-1">
                {salesByOwner.slice(0, 8).map((sale, i) => (
                  <div key={sale.id} className="flex items-center justify-between p-6 bg-[#1E1E24] rounded-2xl border border-[#363645] hover:border-[#FB923C] transition-all group">
                     <div className="flex items-center gap-5">
                        <span className="text-zinc-600 font-bold italic text-sm group-hover:text-white transition-colors">{i + 1}º</span>
                        <p className="text-sm font-black text-white italic uppercase">{sale.full_name}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-[#FB923C] italic tracking-tighter">R$ {sale.totalValue.toLocaleString()}</p>
                        <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{sale.soldLeads} FECHAMENTOS</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  )
}

// --- ADMIN MANAGEMENT ---
const AdminManagement = () => {
  const [employees, setEmployees] = useState<any[]>([])
  const { addTask } = useTasks()
  const [selectedEmp, setSelectedEmp] = useState<any>(null)
  const [taskTitle, setTaskTitle] = useState('')
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
    if (!error) { setEditEmp(null); fetchEmployees(); alert('Perfil Sincronizado.'); }
    else { alert('Erro ao Sincronizar: ' + error.message) }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmp || !taskTitle) return
    const { data: { user } } = await supabase.auth.getUser()
    await addTask({ 
      title: taskTitle.toUpperCase(), 
      assigned_to: selectedEmp.id,
      created_by: user?.id,
      status: 'pending' 
    })
    setTaskTitle('')
    setSelectedEmp(null)
    alert('Ordem de Execução Enviada.');
  }

  return (
    <div className="space-y-12 animate-fade-in-up">
       <div className="flex items-center justify-between">
         <div className="space-y-2">
           <h2 className="text-5xl font-black tracking-tighter text-white italic uppercase leading-none">GESTÃO ELITE</h2>
           <div className="flex items-center gap-4">
             <div className="h-[2px] w-12 bg-[#FB923C]"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">CONTROLE DE RECURSOS E ATRIBUIÇÕES</p>
           </div>
         </div>
       </div>

       <div className="bg-[#2A2A35] border border-[#363645] rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1E1E24]">
              <tr>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#363645]">Operador / Tag</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#363645]">Cargo</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#363645] text-center">Ações Rápidas</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#363645] text-right">Configurações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363645]">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center text-white font-black italic text-lg shadow-lg group-hover:scale-110 transition-transform">
                        {emp.full_name?.[0]}
                      </div>
                      <div>
                        <p className="text-md font-bold text-white uppercase italic">{emp.full_name}</p>
                        <p className="text-[9px] text-[#FB923C] font-black uppercase tracking-widest mt-1 italic">TAG: {emp.tag || 'PENDENTE'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-[#1E1E24] border border-[#363645] rounded text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">{emp.role === 'admin' ? 'CEO' : emp.role?.toUpperCase()}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button onClick={() => setSelectedEmp(emp)} className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-xl text-[10px] font-bold tracking-widest hover:bg-[#2E5BFF] transition-all shadow-lg active:scale-95 uppercase">
                      <Plus size={14} /> Enviar Task
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => setEditEmp({ ...emp, points_pos: emp.points_pos?.join(', ') || '', points_neg: emp.points_neg?.join(', ') || '' })} className="p-3 bg-[#1E1E24] border border-[#363645] rounded-xl text-zinc-500 hover:text-white transition-all hover:border-white">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
       </div>

       {editEmp && (
          <div className="fixed inset-0 bg-[#1E1E24]/90 backdrop-blur-3xl flex items-center justify-center p-4 z-[400] animate-in fade-in transition-all">
             <form onSubmit={handleUpdateEmp} className="w-full max-w-2xl bg-[#2A2A35] border border-[#363645] p-12 rounded-2xl space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#FB923C]"></div>
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Ajustar Operador</h3>
                      <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">ALVO: {editEmp.full_name}</p>
                   </div>
                   <button type="button" onClick={() => setEditEmp(null)} className="p-2 text-zinc-500 hover:text-white transition-all"><X size={24} /></button>
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Função no Studio</label><input className="w-full bg-[#1E1E24] border border-[#363645] p-4 rounded-xl text-white font-bold text-xs outline-none focus:border-[#3B82F6] transition-all uppercase" value={editEmp.role} onChange={e => setEditEmp({...editEmp, role: e.target.value})} placeholder="CEO / Assessor / etc" /></div>
                   <div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Tag Identificadora</label><input className="w-full bg-[#1E1E24] border border-[#363645] p-4 rounded-xl text-white font-bold text-xs outline-none focus:border-[#3B82F6] transition-all uppercase" value={editEmp.tag} onChange={e => setEditEmp({...editEmp, tag: e.target.value})} /></div>
                   <div className="col-span-2 space-y-2"><label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Pontos Fortes (separados por vírgula)</label><input className="w-full bg-[#1E1E24] border border-[#363645] p-4 rounded-xl text-white font-bold text-xs outline-none focus:border-[#3B82F6] transition-all uppercase" value={editEmp.points_pos} onChange={e => setEditEmp({...editEmp, points_pos: e.target.value})} /></div>
                   <div className="col-span-2 space-y-2"><label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">A Melhorar (separados por vírgula)</label><input className="w-full bg-[#1E1E24] border border-[#363645] p-4 rounded-xl text-white font-bold text-xs outline-none focus:border-[#3B82F6] transition-all uppercase" value={editEmp.points_neg} onChange={e => setEditEmp({...editEmp, points_neg: e.target.value})} /></div>
                </div>
                <button type="submit" className="w-full py-6 bg-[#FB923C] text-white rounded-xl font-black text-xs tracking-widest hover:bg-[#E8822B] transition-all uppercase shadow-xl active:scale-95">Sincronizar Hierarquia</button>
             </form>
          </div>
       )}

       {selectedEmp && (
          <div className="fixed inset-0 bg-[#1E1E24]/90 backdrop-blur-3xl flex items-center justify-center p-4 z-[400] animate-in fade-in transition-all">
             <form onSubmit={handleAddTask} className="w-full max-w-lg bg-[#2A2A35] border border-[#363645] p-12 rounded-2xl space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#3B82F6]"></div>
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Ordem de Execução</h3>
                      <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">ALVO: {selectedEmp.full_name}</p>
                   </div>
                   <button type="button" onClick={() => setSelectedEmp(null)} className="p-2 text-zinc-500 hover:text-white transition-all"><X size={24} /></button>
                </div>
                <div className="space-y-8">
                   <div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Definição da Task</label><input required className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-xl text-white text-xs font-bold outline-none focus:border-[#3B82F6] transition-all uppercase" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="EX: ANALISAR LEADS DO CANAL ELITE" /></div>
                   <button type="submit" className="w-full py-6 bg-[#3B82F6] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#2E5BFF] shadow-xl active:scale-95">Enviar Comando</button>
                </div>
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
             <div className="h-[2px] w-12 bg-[#3B82F6]"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">SUAS DIRETRIZES OPERACIONAIS</p>
           </div>
         </div>
       </div>

       <div className="grid grid-cols-1 gap-6">
         {tasks.map(task => (
           <div key={task.id} className="bg-[#2A2A35] border border-[#363645] p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 group hover:border-[#3B82F6] transition-all duration-300 shadow-xl">
             <div className="flex items-center gap-6 flex-1">
               <div className="w-16 h-16 bg-[#1E1E24] border border-[#363645] rounded-2xl flex items-center justify-center text-[#3B82F6] group-hover:scale-110 transition-transform shadow-inner">
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
                  className={`px-10 py-5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${task.status === 'completed' ? 'bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]' : 'bg-[#3B82F6] text-white hover:bg-[#2E5BFF] shadow-lg active:scale-95'}`}
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
    { label: 'Suas Tarefas', value: tasks.filter(t => t.status === 'pending').length, icon: <ListTodo size={18} /> },
    { label: 'Equity Estimado', value: `R$ ${leads.reduce((acc, curr) => acc + (Number(curr.faturamento_estimado) || 0), 0).toLocaleString()}`, icon: <DollarSign size={18} /> },
    { label: 'Suas Vendas', value: leads.filter(l => l.owner_id === profile?.id && l.status === 'vendido').length, icon: <Trophy size={18} /> },
    { label: 'Agendamentos', value: leads.filter(l => l.owner_id === profile?.id && l.status === 'agendamento').length, icon: <CalendarIcon size={18} /> },
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
          <div key={i} className="bg-[#2A2A35] border border-[#363645] p-10 rounded-2xl flex flex-col gap-10 hover:border-[#3B82F6] transition-all duration-300 shadow-xl group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="p-4 bg-[#1E1E24] text-[#3B82F6] rounded-xl group-hover:scale-110 transition-all border border-[#363645]">{stat.icon}</span>
              <div className="w-2 h-2 bg-[#FB923C] rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 tracking-widest mb-2 uppercase">{stat.label}</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 bg-[#2A2A35] border border-[#363645] p-12 rounded-2xl shadow-xl space-y-12">
            <h3 className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 border-b border-[#363645] pb-6 uppercase">Sua Performance: {profile?.full_name}</h3>
            <div className="space-y-10">
               <div className="space-y-6">
                  <p className="text-[10px] font-black text-white flex items-center gap-3 uppercase tracking-widest"><ThumbsUp size={14} className="text-[#10B981]" /> Pontos Fortes</p>
                  <div className="flex flex-wrap gap-2">
                    {(profile?.points_pos || ['Agilidade', 'Execução']).map((p: any, i: number) => (
                       <span key={i} className="text-[9px] bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] px-4 py-2 rounded-lg font-black italic uppercase">{p}</span>
                    ))}
                  </div>
               </div>
               <div className="space-y-6">
                  <p className="text-[10px] font-black text-white flex items-center gap-3 uppercase tracking-widest"><ThumbsDown size={14} className="text-[#FB923C]" /> A Melhorar</p>
                  <div className="flex flex-wrap gap-2">
                    {(profile?.points_neg || ['Pontualidade']).map((p: any, i: number) => (
                       <span key={i} className="text-[9px] bg-[#FB923C]/10 border border-[#FB923C]/20 text-[#FB923C] px-4 py-2 rounded-lg font-black italic uppercase">{p}</span>
                    ))}
                  </div>
               </div>
            </div>
        </div>
        <div className="lg:col-span-2 bg-[#2A2A35] border border-[#363645] p-12 rounded-2xl shadow-xl flex flex-col">
            <h3 className="text-[10px] font-bold border-b border-[#363645] pb-6 mb-10 text-zinc-500 tracking-widest uppercase italic">Últimas Atividades do Operador</h3>
            <div className="space-y-4 flex-1">
               {leads.filter(l => l.owner_id === profile.id).slice(0, 6).map(lead => (
                 <div key={lead.id} className="flex items-center gap-8 p-6 bg-[#1E1E24] border border-[#363645] rounded-xl hover:border-[#3B82F6] transition-all group">
                    <div className="w-12 h-12 bg-[#2A2A35] rounded-lg flex items-center justify-center text-white font-black italic text-lg">{lead.name?.[0]}</div>
                    <div className="flex-1 truncate">
                       <p className="text-lg font-bold text-white italic truncate uppercase">{lead.name}</p>
                       <p className="text-[9px] text-[#FB923C] font-black tracking-widest mt-1 uppercase leading-none">{lead.status?.replace('_', ' ')}</p>
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
             <div className="h-[2px] w-12 bg-[#3B82F6]"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">GESTOR DE ATIVOS LINEAR</p>
           </div>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="bg-[#3B82F6] text-white px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#2E5BFF] transition-all flex items-center gap-4 shadow-xl active:scale-95 group">
           <Plus size={18} className="group-hover:rotate-90 transition-transform" />
           <span>Cadastrar Lead Elite</span>
         </button>
       </div>

       <div className="bg-[#2A2A35] border border-[#363645] rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-[#363645] bg-[#1E1E24]/50 flex items-center gap-6">
             <Search size={18} className="text-zinc-500" />
             <input placeholder="Pesquisar ecossistema..." className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-zinc-700" />
          </div>
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
                          <div className="w-12 h-12 bg-[#2A2A35] border border-[#363645] rounded-xl flex items-center justify-center text-white font-black italic text-lg shadow-inner group-hover:scale-110 transition-transform">{lead.name?.[0]}</div>
                          <div>
                             <p className="text-lg font-bold text-white italic truncate max-w-[200px] uppercase leading-none">{lead.name}</p>
                             <p className="text-[9px] text-zinc-500 font-bold tracking-widest mt-2 uppercase italic">{lead.product_type || 'ESTRATÉGIA'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-center text-[10px] font-black text-[#FB923C] italic">{lead.ai_score || 0}% POTENCIAL</td>
                    <td className="px-10 py-8 text-white font-black text-lg italic tracking-tighter">R$ {Number(lead.faturamento_estimado || 0).toLocaleString()}</td>
                    <td className="px-10 py-8">
                       <span className="px-3 py-1 bg-[#1E1E24] border border-[#363645] rounded text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">{lead.status?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex items-center justify-end gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { if(confirm('Remover Lead Permanente?')) deleteLead(lead.id) }} className="text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                          <button className="text-zinc-500 hover:text-[#3B82F6] transition-colors"><ChevronRight size={18} /></button>
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
         <div className="fixed inset-0 bg-[#14130E]/95 backdrop-blur-md flex flex-col items-center justify-center z-[200] animate-in fade-in">
           <div className="w-20 h-20 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-8"></div>
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
             <div className="h-[2px] w-12 bg-[#3B82F6]"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">GESTÃO DE FLUXO ESTRATÉGICO</p>
           </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-8 overflow-x-auto pb-12 custom-scrollbar px-1 min-h-[800px] items-start">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided: DroppableProvided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex-shrink-0 w-[400px] flex flex-col gap-6 bg-[#2A2A35]/30 border border-[#363645] p-6 rounded-2xl relative transition-all min-h-[150px]">
                  <div className="flex items-center justify-between border-b border-[#363645] pb-6 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-5 bg-[#3B82F6] rounded-full"></div>
                      <h3 className="font-black text-white uppercase text-[10px] tracking-widest leading-none">{column.label}</h3>
                    </div>
                    <span className="text-[9px] font-black text-zinc-500 bg-[#1E1E24] px-2 py-1 rounded border border-[#363645]">{leads.filter(l => l.status === column.id).length}</span>
                  </div>
                  
                  <div className="space-y-6">
                    {leads.filter(l => l.status === column.id).map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-[#2A2A35] border border-[#363645] p-8 rounded-2xl transition-all duration-300 relative group shadow-xl ${snapshot.isDragging ? 'rotate-2 scale-105 border-[#3B82F6] z-50 shadow-[#3B82F6]/20' : 'hover:border-[#3B82F6]'}`}>
                             <div className="flex justify-between items-start mb-6">
                               <div className="flex-1">
                                 <div className="flex gap-2 mb-4">
                                   <TempBadge temp={lead.temperature} />
                                   {lead.status === 'vendido' && <span className="text-[9px] font-black bg-[#10B981] text-white px-3 py-1 rounded italic uppercase tracking-tighter">Equity Fechado</span>}
                                 </div>
                                 <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-[#3B82F6] transition-all italic truncate uppercase">{lead.name}</h4>
                               </div>
                               <div className="flex flex-col items-end gap-2">
                                  <span className="text-[9px] font-black py-1 px-3 bg-[#1E1E24] text-[#FB923C] rounded border border-[#363645] italic">{lead.ai_score || 0}% IA</span>
                               </div>
                             </div>
                             
                             <div className="space-y-4 mb-8">
                               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-3"><Briefcase size={12} className="text-[#3B82F6]" /> {lead.product_type || 'ESTRATÉGIA'}</p>
                               <p className="text-2xl text-white font-black tracking-tighter italic">R$ {Number(lead.faturamento_estimado || 0).toLocaleString()}</p>
                             </div>
                             
                             <div className="border-t border-[#363645] pt-6 flex justify-between items-center">
                               <div>
                                 <p className="text-[8px] text-zinc-600 font-bold uppercase mb-1">Operador Responsável</p>
                                 <p className="text-[10px] text-zinc-400 font-black italic truncate max-w-[150px] uppercase">{lead.registered_by_name || 'AGENTE STUDIO'}</p>
                               </div>
                               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                 <button onClick={() => deleteLead(lead.id)} className="p-3 bg-[#1E1E24] rounded-xl text-zinc-600 hover:text-red-400 transition-colors border border-[#363645]"><Trash2 size={16} /></button>
                                 <button className="p-3 bg-[#1E1E24] rounded-xl text-zinc-600 hover:text-[#3B82F6] transition-colors border border-[#363645]"><ChevronRight size={16} /></button>
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
             <div className="h-[2px] w-12 bg-[#FB923C]"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">MONITORAMENTO DE RELACIONAMENTO</p>
           </div>
      </div>

      <div className="space-y-6">
        {followUpLeads.map(lead => (
          <div key={lead.id} className="bg-[#2A2A35] border border-[#363645] p-10 rounded-2xl flex flex-col lg:flex-row items-center gap-12 group transition-all duration-300 shadow-xl hover:border-[#3B82F6]">
             <div className="flex items-center gap-8 min-w-[350px]">
                <div className="w-20 h-20 bg-[#1E1E24] border border-[#363645] rounded-2xl flex items-center justify-center text-3xl font-black text-white italic shadow-inner group-hover:scale-110 transition-transform">{lead.name?.[0]}</div>
                <div>
                   <h4 className="text-3xl font-black text-white tracking-tight italic uppercase">{lead.name}</h4>
                   <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-3 uppercase italic leading-none">Ativo desde: <span className="text-[#3B82F6]">{formatTimeElapsed(lead.status_changed_at)}</span></p>
                </div>
             </div>
             <div className="flex-1 w-full grid grid-cols-3 gap-3">
                {phases.map((phase, i) => (
                  <button 
                    key={i} 
                    onClick={() => updateFollowUpPhase(lead.id, i + 1)} 
                    className={`py-6 rounded-xl border transition-all text-[9px] font-black tracking-widest uppercase italic shadow-md active:scale-95 ${ (lead.follow_up_phase || 0) >= i + 1 ? 'bg-[#3B82F6] text-white border-[#3B82F6]' : 'bg-[#1E1E24] border-[#363645] text-zinc-600 hover:text-white' }`}
                  >
                    { (lead.follow_up_phase || 0) > i + 1 ? <CheckCircle2 size={16} className="mx-auto" /> : <span>{i + 1}. {phase.title}</span> }
                  </button>
                ))}
             </div>
             <div className="flex gap-4">
                <button onClick={() => updateLeadStatus(lead.id, 'compareceu')} className="p-5 bg-[#3B82F6] text-white rounded-xl hover:bg-[#2E5BFF] transition-all shadow-xl active:scale-95"><UserCheck size={22} /></button>
                <button onClick={() => { if(confirm('Remover?')) deleteLead(lead.id) }} className="p-5 bg-[#1E1E24] text-zinc-500 rounded-xl border border-[#363645] hover:text-red-400 hover:border-red-400 transition-all active:scale-95"><Trash2 size={22} /></button>
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
             <div className="h-[2px] w-12 bg-[#3B82F6]"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">SINCRONIZAÇÃO DE ATENDIMENTOS</p>
           </div>
         </div>
         <div className="flex items-center gap-8 bg-[#2A2A35] border border-[#363645] p-4 rounded-2xl text-white font-bold text-xs tracking-widest italic uppercase shadow-xl">
           <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:text-[#3B82F6] transition-colors"><ChevronRight size={22} className="rotate-180" /></button>
           <span className="min-w-[150px] text-center">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
           <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:text-[#3B82F6] transition-colors"><ChevronRight size={22} /></button>
         </div>
       </div>

       <div className="bg-[#2A2A35] border border-[#363645] rounded-3xl overflow-hidden shadow-2xl">
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
                  <div className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-bold mb-4 ${isToday ? 'bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20' : 'text-zinc-600'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-2">
                    {dayMeetings.map((m, j) => (
                      <div key={j} className="bg-[#1E1E24] border border-[#363645] p-3 rounded-xl text-[9px] font-bold tracking-tight leading-tight flex flex-col gap-1 border-l-4 border-l-[#FB923C] shadow-lg group hover:border-l-[#3B82F6] transition-all">
                        <span className="text-[#FB923C] group-hover:text-[#3B82F6] transition-colors">{m.meeting_time}H</span>
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
             <div className="h-[2px] w-12 bg-[#3B82F6]"></div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-medium leading-none">PARAMETRIZAÇÃO DE OPERADOR</p>
           </div>
       </div>

       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-12">
             <div className="bg-[#2A2A35] border border-[#363645] p-10 rounded-3xl shadow-xl space-y-8">
                <div className="border-b border-[#363645] pb-6 flex items-center gap-4">
                   <User size={20} className="text-[#3B82F6]" />
                   <h3 className="text-sm font-black text-white italic uppercase tracking-widest leading-none">Identidade Studio</h3>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Nome do Operador</label>
                      <input className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-xl text-white text-sm font-bold outline-none focus:border-[#3B82F6] transition-all" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                   </div>
                   <div className="space-y-2 opacity-50">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Cargo Atual (Via Admin)</label>
                      <div className="w-full bg-transparent border border-[#363645] p-5 rounded-xl text-zinc-500 text-sm font-bold">{profile?.role?.toUpperCase()}</div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Tag Identificadora</label>
                      <input className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-xl text-white text-sm font-bold outline-none focus:border-[#3B82F6] transition-all" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} />
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-12">
             <div className="bg-[#2A2A35] border border-[#363645] p-10 rounded-3xl shadow-xl space-y-8">
                <div className="border-b border-[#363645] pb-6 flex items-center gap-4">
                   <Phone size={20} className="text-[#FB923C]" />
                   <h3 className="text-sm font-black text-white italic uppercase tracking-widest leading-none">Linhas de Contato</h3>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">WhatsApp</label>
                      <input className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-xl text-white text-sm font-bold outline-none focus:border-[#3B82F6] transition-all" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">WhatsApp Comercial</label>
                      <input className="w-full bg-[#1E1E24] border border-[#363645] p-5 rounded-xl text-white text-sm font-bold outline-none focus:border-[#3B82F6] transition-all" value={formData.whatsapp_business} onChange={e => setFormData({...formData, whatsapp_business: e.target.value})} />
                   </div>
                </div>
             </div>
             
             <button type="submit" className="w-full bg-[#3B82F6] text-white p-8 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#2E5BFF] transition-all shadow-xl active:scale-95 shadow-[#3B82F6]/20">Salvar Ajustes Studio</button>
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
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); if (session) fetchProfile(session.user.id, session.user.email); setLoading(false); })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); if (session) fetchProfile(session.user.id, session.user.email); else setProfile(null); })
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
