import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LayoutDashboard, Users, Columns, MessageSquare, Calendar as CalendarIcon, Settings as SettingsIcon, LogOut, Plus, Search, Filter, TrendingUp, DollarSign, UserCheck, Globe, Smartphone, Sparkles, Sun, Moon, ThumbsUp, ThumbsDown, Trash2, Clock, CheckCircle2, ChevronRight, X, Flame, AlertCircle, Briefcase, Calendar, User, Mail, Tag, Phone, ShieldCheck, ListTodo, MoreVertical, Edit2, Crown, Trophy, Target } from 'lucide-react'
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
  if (loading) return <div className="h-screen bg-[#14130E] flex items-center justify-center font-black uppercase text-xs tracking-[0.5em] text-zinc-900 animate-pulse">SINCRONIZANDO STUDIO...</div>
  if (!session) return <Login />
  return <Layout profile={profile} onSignOut={onSignOut}>{children}</Layout>
}

// Layout Component (Fixed Sidebar Architecture - Linear Edition)
const Layout = ({ children, profile, onSignOut }: { children: React.ReactNode, profile: any, onSignOut: () => void }) => {
  const location = useLocation();
  const isAdmin = profile?.role === 'admin';

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'PAINEL', path: '/' },
    ...(isAdmin ? [
      { icon: <ShieldCheck size={18} />, label: 'CENTRAL CEO', path: '/admin' },
      { icon: <Target size={18} />, label: 'GESTÃO ELITE', path: '/admin/management' }
    ] : []),
    { icon: <Users size={18} />, label: 'ECOSSISTEMA', path: '/leads' },
    { icon: <Columns size={18} />, label: 'PIPELINE', path: '/kanban' },
    { icon: <MessageSquare size={18} />, label: 'FOLLOW-UP', path: '/follow-up' },
    { icon: <ListTodo size={18} />, label: 'TASKS', path: '/tasks' },
    { icon: <CalendarIcon size={18} />, label: 'AGENDA STUDIO', path: '/appointments' },
    { icon: <SettingsIcon size={18} />, label: 'AJUSTES', path: '/settings' },
  ]
  return (
    <div className={`flex min-h-screen font-outfit selection:bg-white/10 overflow-x-hidden transition-colors duration-500 bg-[#14130E] text-white`}>
      <aside className={`w-64 fixed left-0 top-0 h-screen border-r border-[#2A2922] bg-[#14130E] flex flex-col p-6 z-50 rounded-none shadow-2xl`}>
        <div className="mb-12 px-2 flex items-center justify-between border-b border-[#2A2922] pb-8">
          <div className="flex flex-col gap-4">
            <img src="https://github.com/legendragon03453-dot/FILIPPO-SITE/blob/main/U.webp?raw=true" alt="UNICO" className="w-16 h-auto brightness-200" />
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-light">Linear Designer CRM</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">{navItems.map((item) => (<Link key={item.path} to={item.path} className={`flex items-center gap-4 px-4 py-4 rounded-none transition-all duration-200 group ${location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/') ? 'bg-white text-black font-black' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}><span className={`transition-colors duration-200 ${location.pathname === item.path ? 'text-black' : 'group-hover:text-white'}`}>{item.icon}</span><span className="text-[10px] uppercase font-bold tracking-widest">{item.label}</span></Link>))}</nav>
        <div className="mt-auto pt-8 border-t border-[#2A2922] space-y-6"><div className="px-4 py-4 bg-[#1C1B16] border border-[#2A2922] rounded-none"><div className="flex items-center gap-2 mb-2"><ShieldCheck size={10} className="text-zinc-700" /><p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">{profile?.role || 'STUDIO AGENT'}</p></div><p className="text-sm font-black tracking-tighter truncate text-white uppercase italic">{profile?.full_name || 'STUDIO AGENT'}</p></div><button onClick={onSignOut} className="flex items-center gap-4 px-4 py-3 w-full text-zinc-700 hover:text-white transition-all group active:scale-95 transition-all"><LogOut size={18} /><span className="text-xs uppercase font-bold tracking-widest">FECHAR SISTEMA</span></button></div>
      </aside>
      <main className="flex-1 ml-64 p-12 overflow-x-hidden min-h-screen text-white uppercase"><div className="max-w-[1600px] mx-auto">{children}</div></main>
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
     <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 z-[300] animate-in fade-in duration-300"><div className="w-full max-w-md bg-[#1C1B16] border border-[#2A2922] p-12 space-y-10 shadow-2xl"><div className="space-y-2"><h3 className="text-2xl font-black text-white italic tracking-tighter">AGENDAMENTO ELITE</h3><p className="text-[10px] text-zinc-700 font-bold tracking-widest uppercase">REUNIÃO ESTRATÉGICA PARA {lead.name}</p></div><div className="space-y-6"><div className="space-y-2"><label className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">DATA DO ENCONTRO</label><input type="date" className="w-full bg-[#14130E] border border-[#2A2922] p-5 text-white text-xs font-black outline-none focus:border-white transition-all uppercase" value={date} onChange={e => setDate(e.target.value)} /></div><div className="space-y-2"><label className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">HORÁRIO EXCLUSIVO</label><input type="time" className="w-full bg-[#14130E] border border-[#2A2922] p-5 text-white text-xs font-black outline-none focus:border-white transition-all" value={time} onChange={e => setTime(e.target.value)} /></div></div><div className="flex gap-4 pt-10"><button onClick={onClose} className="flex-1 py-5 border border-[#2A2922] text-[10px] font-black text-zinc-700 hover:text-white transition-all uppercase">CANCELAR</button><button onClick={() => onSave(date, time)} className="flex-2 py-5 bg-white text-black text-[10px] font-black tracking-widest hover:bg-zinc-200 transition-all shadow-xl uppercase">CONFIRMAR AGENDA</button></div></div></div>
  )
}

// --- ADMIN DASHBOARD ---
const AdminDashboard = () => {
  const { leads, loading } = useLeads()
  const { tasks } = useTasks()
  const [employees, setEmployees] = useState<any[]>([])

  useEffect(() => { supabase.from('profiles').select('*').then(({ data }) => setEmployees(data || [])) }, [])

  const salesByOwner = employees.map(emp => {
    const soldLeads = leads.filter(l => l.owner_id === emp.id && l.status === 'vendido')
    const totalValue = soldLeads.reduce((acc, curr) => acc + (Number(curr.faturamento_estimado) || 0), 0)
    return { ...emp, soldLeads: soldLeads.length, totalValue }
  }).sort((a, b) => b.totalValue - a.totalValue)

  const faturamentoTotal = leads.reduce((acc, curr) => acc + (Number(curr.faturamento_estimado) || 0), 0)
  const completedTasks = tasks.filter(t => t.status === 'completed').length

  const stats = [
    { label: 'EQUITY CONVERSÃO', value: `R$ ${faturamentoTotal.toLocaleString()}`, icon: <DollarSign />, color: 'white' },
    { label: 'FLUXO MONITORADO', value: leads.length, icon: <Users />, color: 'white' },
    { label: 'QUADRO ELITE', value: employees.length, icon: <User />, color: 'white' },
    { label: 'EXECUÇÃO OPERACIONAL', value: `${completedTasks} / ${tasks.length}`, icon: <CheckCircle2 />, color: 'white' }
  ]

  if (loading) return <div className="text-zinc-900 flex items-center justify-center min-h-[50vh] font-black uppercase anime-pulse text-[12px] tracking-[1em]">LENDO SISTEMA...</div>

  return (
    <div className="space-y-16 animate-fade-in-up uppercase">
       <div className="flex items-center justify-between"><div><h2 className="text-8xl font-black tracking-tighter mb-4 text-white italic">CENTRAL CEO</h2><p className="text-[11px] text-zinc-600 uppercase tracking-[0.6em] font-light">VISÃO ANALÍTICA E ESTRATÉGICA DO ESTÚDIO.</p></div></div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
             <div key={i} className="bg-[#1C1B16] border border-[#2A2922] p-10 flex flex-col gap-10 group hover:bg-[#2A2922] transition-all shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center"><span className="p-4 bg-white text-black group-hover:scale-110 transition-all shadow-inner">{stat.icon}</span><p className="text-[10px] font-black tracking-[0.3em] text-zinc-700">HQ DATA</p></div>
                <div><p className="text-[10px] font-bold text-zinc-600 tracking-[0.2em] mb-2">{stat.label}</p><h3 className="text-3xl font-black text-white italic tracking-tighter">{stat.value}</h3></div>
             </div>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-[#1C1B16] border border-[#2A2922] p-12 shadow-2xl space-y-10">
             <div className="flex items-center gap-4 border-b border-[#2A2922] pb-6"><Trophy size={18} className="text-white" /><h3 className="text-[10px] font-black text-zinc-700 tracking-widest uppercase">RANKING DE CONVERSÃO (TOP OPERADORES)</h3></div>
             <div className="space-y-6">
                {salesByOwner.slice(0, 5).map((owner, i) => (
                  <div key={owner.id} className="flex items-center gap-8 p-6 bg-black/40 border border-[#2A2922] group hover:border-white transition-all shadow-xl relative">
                     <div className="w-12 h-12 bg-zinc-900 border border-[#2A2922] flex items-center justify-center font-black text-white italic text-xl">{i + 1}</div>
                     <div className="flex-1"><h4 className="text-xl font-black text-white italic truncate">{owner.full_name}</h4><p className="text-[8px] text-zinc-700 font-bold tracking-widest mt-1 uppercase">VOL: {owner.soldLeads} VENDAS</p></div>
                     <div className="text-right"><p className="text-lg font-black text-white italic tracking-tighter">R$ {owner.totalValue.toLocaleString()}</p></div>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-[#1C1B16] border border-[#2A2922] p-12 shadow-2xl space-y-10">
             <div className="flex items-center gap-4 border-b border-[#2A2922] pb-6"><ListTodo size={18} className="text-white" /><h3 className="text-[10px] font-black text-zinc-700 tracking-widest uppercase">MONITORAMENTO DE EXECUÇÃO (TASKS)</h3></div>
             <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                {employees.map(emp => {
                  const empTasks = tasks.filter(t => t.assigned_to === emp.id)
                  const empCompleted = empTasks.filter(t => t.status === 'completed').length
                  return (
                    <div key={emp.id} className="p-6 border border-[#2A2922] hover:bg-white/5 transition-all">
                       <div className="flex justify-between items-center mb-3">
                          <p className="text-xs font-black text-white italic uppercase">{emp.full_name}</p>
                          <p className="text-[9px] font-black text-zinc-600 uppercase">{empCompleted}/{empTasks.length} MISSÕES</p>
                       </div>
                       <div className="w-full h-1 bg-zinc-900"><div className="h-full bg-white transition-all duration-1000" style={{ width: `${(empCompleted/empTasks.length) * 100 || 0}%` }}></div></div>
                    </div>
                  )
                })}
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
       role: editEmp.role, // Note: must match DB enum ('admin' or 'sales') if possible, or string if text
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
      assigned_to: selectedEmp.id, // Fixed mapping
      created_by: user?.id,
      status: 'pending' 
    })
    setTaskTitle('')
    setSelectedEmp(null)
    alert('Ordem de Execução Enviada.');
  }

  return (
    <div className="space-y-16 animate-fade-in-up uppercase">
       <div className="flex items-center justify-between"><div><h2 className="text-8xl font-black tracking-tighter mb-4 text-white italic">GESTÃO ELITE</h2><p className="text-[11px] text-zinc-600 uppercase tracking-[0.6em] font-light">CONTROLE DE RECURSOS E ATRIBUIÇÕES DO ESTÚDIO.</p></div></div>
       <div className="bg-[#1C1B16] border border-[#2A2922] p-12 shadow-2xl">
          <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead className="text-zinc-700 text-[10px] uppercase font-black border-b border-[#2A2922]"><tr><th className="px-10 py-8">OPERADOR / TAG</th><th className="px-10 py-8">CARGO</th><th className="px-10 py-8 text-center">TASKS</th><th className="px-10 py-8 text-right">AÇÕES</th></tr></thead>
            <tbody className="divide-y divide-zinc-900">{employees.map(emp => (
              <tr key={emp.id} className="hover:bg-white/5 transition-colors"><td className="px-10 py-8"><div className="flex items-center gap-6"><div className="w-14 h-14 bg-black border border-zinc-900 flex items-center justify-center text-white font-black italic">{emp.full_name?.[0]}</div><div><p className="text-xl font-black text-white italic truncate">{emp.full_name}</p><p className="text-[10px] text-zinc-800 italic uppercase mt-1">TAG: {emp.tag || 'PENDENTE'}</p></div></div></td>
                <td className="px-10 py-8"><span className="text-[10px] font-black px-4 py-2 border border-zinc-800 bg-black text-zinc-600 uppercase">{emp.role === 'admin' ? 'CEO' : emp.role}</span></td>
                <td className="px-10 py-8 text-center"><button onClick={() => setSelectedEmp(emp)} className="inline-flex items-center gap-3 text-[10px] font-black text-white bg-zinc-900 px-6 py-3 border border-zinc-800 hover:bg-white hover:text-black transition-all active:scale-95 uppercase"><Plus size={14} /> ENVIAR TASK</button></td>
                <td className="px-10 py-8 text-right"><button onClick={() => setEditEmp({ ...emp, points_pos: emp.points_pos?.join(', ') || '', points_neg: emp.points_neg?.join(', ') || '' })} className="p-4 border border-zinc-900 text-zinc-700 hover:text-white transition-all active:scale-95"><Edit2 size={18} /></button></td></tr>
            ))}</tbody></table></div>
       </div>

       {editEmp && (
          <div className="fixed inset-0 bg-black/98 flex items-center justify-center p-4 z-[400] animate-in fade-in transition-all">
             <form onSubmit={handleUpdateEmp} className="w-full max-w-2xl bg-[#1C1B16] border border-[#2A2922] p-16 space-y-12 shadow-2xl relative">
                <div className="flex justify-between items-start"><div><h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">AJUSTAR OPERADOR</h3><p className="text-[11px] text-zinc-600 tracking-widest font-black uppercase mt-1">ALVO: {editEmp.full_name}</p></div><button type="button" onClick={() => setEditEmp(null)}><X size={32} className="text-zinc-800 hover:text-white" /></button></div>
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 tracking-widest uppercase">FUNÇÃO NO STUDIO</label><input className="w-full bg-[#14130E] border border-[#2A2922] p-5 text-white font-black text-xs outline-none focus:border-white transition-all uppercase" value={editEmp.role} onChange={e => setEditEmp({...editEmp, role: e.target.value})} placeholder="CEO/Asessor/etc" /></div>
                   <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 tracking-widest uppercase">TAG IDENTIFICADORA</label><input className="w-full bg-[#14130E] border border-[#2A2922] p-5 text-white font-black text-xs outline-none focus:border-white transition-all uppercase" value={editEmp.tag} onChange={e => setEditEmp({...editEmp, tag: e.target.value})} /></div>
                   <div className="col-span-2 space-y-2"><label className="text-[10px] font-black text-zinc-600 tracking-widest uppercase">PONTOS FORTES (VÍRGULA)</label><input className="w-full bg-[#14130E] border border-[#2A2922] p-5 text-white font-black text-xs outline-none focus:border-white transition-all uppercase" value={editEmp.points_pos} onChange={e => setEditEmp({...editEmp, points_pos: e.target.value})} /></div>
                   <div className="col-span-2 space-y-2"><label className="text-[10px] font-black text-zinc-600 tracking-widest uppercase">PONTOS A MELHORAR (VÍRGULA)</label><input className="w-full bg-[#14130E] border border-[#2A2922] p-5 text-white font-black text-xs outline-none focus:border-white transition-all uppercase" value={editEmp.points_neg} onChange={e => setEditEmp({...editEmp, points_neg: e.target.value})} /></div>
                </div>
                <button type="submit" className="w-full bg-white text-black p-8 font-black text-xs tracking-[0.5em] hover:bg-zinc-200 transition-all uppercase shadow-xl active:scale-95">SINCRONIZAR HIERARQUIA</button>
             </form>
          </div>
       )}

       {selectedEmp && (
          <div className="fixed inset-0 bg-black/98 flex items-center justify-center p-4 z-[400] animate-in fade-in transition-all">
             <form onSubmit={handleAddTask} className="w-full max-w-lg bg-[#1C1B16] border border-[#2A2922] p-12 space-y-12 shadow-2xl relative">
                <div className="flex justify-between items-start mb-6"><div><h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">ORDEM DE EXECUÇÃO</h3><p className="text-[10px] text-zinc-700 tracking-[0.2em] font-bold uppercase">ALVO: {selectedEmp.full_name}</p></div><button type="button" onClick={() => setSelectedEmp(null)}><X size={32} className="text-zinc-800 hover:text-white" /></button></div>
                <div className="space-y-12"><div className="space-y-4"><label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">DEFINIÇÃO DA TASK</label><input required className="w-full bg-[#14130E] border border-[#2A2922] p-6 text-white text-xs font-black outline-none focus:border-white transition-all uppercase" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="EX: ANALISAR LEADS DO CANAL ELITE" /></div><button type="submit" className="w-full bg-white text-black p-8 font-black text-xs uppercase tracking-[0.5em] hover:bg-zinc-200 shadow-xl active:scale-95">ENVIAR COMANDO</button></div>
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
    <div className="space-y-16 animate-fade-in-up uppercase">
       <div className="flex items-center justify-between"><div><h2 className="text-8xl font-black tracking-tighter mb-4 text-white italic">PULSO DE EXECUÇÃO</h2><p className="text-[11px] text-zinc-600 uppercase tracking-[0.6em] font-light">SUAS DIRETRIZES OPERACIONAIS UNICO STUDIO.</p></div></div>
       <div className="grid grid-cols-1 gap-8">{tasks.map(task => (
           <div key={task.id} className="bg-[#1C1B16] border border-[#2A2922] p-10 flex flex-col md:flex-row items-center gap-12 group hover:bg-[#2A2922] transition-all shadow-xl">
              <div className="flex items-center gap-8 flex-1"><div className="w-14 h-14 border border-[#2A2922] flex items-center justify-center text-zinc-800 group-hover:text-white transition-all"><ListTodo size={24} /></div><div><h4 className={`text-3xl font-black tracking-widest italic uppercase transition-all ${task.status === 'completed' ? 'text-zinc-800 line-through' : 'text-white'}`}>{task.title}</h4><p className="text-[9px] text-zinc-700 tracking-[0.5em] mt-2 italic uppercase">ORDEM ATRIBUÍDA PELA HQ</p></div></div>
              <div className="flex items-center gap-8"><button onClick={() => handleSave(task.id, task.status)} className={`px-12 py-6 text-[10px] font-black uppercase tracking-[0.5em] transition-all ${task.status === 'completed' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-white text-black hover:bg-zinc-200 shadow-lg active:scale-95 uppercase'}`}>{task.status === 'completed' ? 'CONCLUÍDA' : 'EXECUTAR TASK'}</button></div>
           </div>
       ))}{tasks.length === 0 && <div className="py-40 text-center animate-pulse"><p className="text-[11px] text-zinc-900 font-black uppercase tracking-[1em]">SEM ORDENS DE SERVIÇO PENDENTES.</p></div>}</div>
    </div>
  )
}

// Dashboard with Role-Specific metrics
const DashboardUnified = ({ profile }: { profile: any }) => {
  const { leads, loading } = useLeads()
  const { tasks } = useTasks(profile?.id)
  const stats = [{ label: 'PIPELINE ATIVO', value: leads.length, icon: <Users size={18} /> }, { label: 'SUAS TASKS', value: tasks.filter(t => t.status === 'pending').length, icon: <ListTodo size={18} /> }, { label: 'EQUITY ESTIMADO', value: `R$ ${leads.reduce((acc, curr) => acc + (Number(curr.faturamento_estimado) || 0), 0).toLocaleString()}`, icon: <DollarSign size={18} /> }, { label: 'OPORTUNIDADES ELITE', value: leads.filter(l => (l.ai_score || 0) > 80).length, icon: <Sparkles size={18} /> }]
  if (loading) return <div className="text-zinc-900 flex items-center justify-center min-h-[50vh] font-black uppercase animate-pulse text-[12px] tracking-[1em]">SINCRONIZANDO PORTAL...</div>
  return (
    <div className="space-y-16 animate-fade-in-up uppercase">
      <div className="flex items-center justify-between"><h2 className="text-8xl font-black tracking-tighter mb-2 text-white italic">PORTAL STUDIO</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (<div key={i} className="bg-[#1C1B16] border border-[#2A2922] p-10 flex flex-col gap-8 group hover:bg-[#2A2922] transition-all shadow-2xl relative overflow-hidden"><div className="flex items-center justify-between"><span className="p-4 bg-white text-black group-hover:scale-110 transition-all shadow-inner">{stat.icon}</span></div><div><p className="text-[10px] font-bold text-zinc-600 tracking-[0.2em] mb-2">{stat.label}</p><h3 className="text-4xl font-black text-white italic tracking-tighter">{stat.value}</h3></div></div>))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 bg-[#1C1B16] border border-[#2A2922] p-12 shadow-2xl space-y-12"><h3 className="text-[10px] font-black tracking-[0.3em] text-white/50 border-b border-[#2A2922] pb-6">SUA PERFORMANCE: {profile?.full_name}</h3><div className="space-y-10"><div className="space-y-6"><p className="text-[10px] font-black text-white flex items-center gap-3 uppercase"><ThumbsUp size={14} /> PONTOS FORTES</p><div className="flex flex-wrap gap-2">{(profile?.points_pos || ['AGILIDADE', 'EXECUÇÃO']).map((p: any, i: number) => (<span key={i} className="text-[9px] bg-white text-black px-4 py-2 font-black italic uppercase">{p}</span>))}</div></div><div className="space-y-6"><p className="text-[10px] font-black text-white flex items-center gap-3 uppercase"><ThumbsDown size={14} /> A MELHORAR</p><div className="flex flex-wrap gap-2">{(profile?.points_neg || ['PONTUALIDADE']).map((p: any, i: number) => (<span key={i} className="text-[9px] bg-black border border-[#2A2922] text-zinc-600 px-4 py-2 font-black italic uppercase">{p}</span>))}</div></div></div></div>
        <div className="lg:col-span-2 bg-[#1C1B16] border border-[#2A2922] p-12 shadow-2xl"><h3 className="text-[10px] font-black border-b border-[#2A2922] pb-6 mb-10 text-zinc-700 tracking-widest uppercase">MEUS ÚLTIMOS LEADS</h3><div className="space-y-2">{leads.filter(l => l.owner_id === profile.id).slice(0, 6).map(lead => (<div key={lead.id} className="flex items-center gap-8 p-6 hover:bg-white/5 transition-all group"><div className="w-14 h-14 bg-black border border-zinc-900 flex items-center justify-center text-white font-black italic uppercase">{lead.name?.[0]}</div><div className="flex-1 truncate"><p className="text-xl font-black text-white group-hover:text-zinc-200 italic truncate uppercase">{lead.name}</p><p className="text-[9px] text-zinc-700 tracking-widest mt-1 uppercase">STATUS: {lead.status?.replace('_', ' ')}</p></div><div className="text-right text-xs font-black text-white uppercase">{lead.ai_score || 0}% IA</div></div>))}</div></div>
      </div>
    </div>
  )
}

const Leads = () => {
  const { leads, loading, addLead } = useLeads()
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
  if (loading) return <div className="text-zinc-900 flex items-center justify-center min-h-[50vh] font-black uppercase animate-pulse">SINCRONIZANDO...</div>
  return (
    <div className="space-y-16 animate-fade-in-up uppercase">
       <div className="flex justify-between items-end gap-10"><div><h2 className="text-8xl font-black tracking-tighter mb-4 text-white italic uppercase">ECOSSISTEMA</h2><p className="text-[11px] text-zinc-600 uppercase tracking-[0.5em] font-light">CONTROLE DE LEADS LINEAR STUDIO.</p></div><button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-12 py-6 font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-4 group active:scale-95 uppercase"><Plus size={18} /><span>CADASTRAR LEAD ELITE</span></button></div>
       <div className="bg-[#1C1B16] border border-[#2A2922] rounded-none overflow-hidden">
          <div className="p-10 border-b border-[#2A2922] bg-[#14130E] flex items-center gap-8"><Search size={18} className="text-zinc-800" /><input placeholder="PESQUISAR DADOS DE ALTA FIDELIDADE..." className="w-full bg-transparent p-4 text-[10px] font-black text-white tracking-widest outline-none uppercase placeholder:text-zinc-900" /></div>
          <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead className="text-zinc-700 text-[10px] uppercase tracking-[0.4em] font-black border-b border-[#2A2922]"><tr><th className="px-10 py-8">DISCIPLINA / NOME</th><th className="px-10 py-8 text-center text-[10px] uppercase">TEMP.</th><th className="px-10 py-8 text-[10px] uppercase">INVESTIMENTO</th><th className="px-10 py-8 text-[10px] uppercase">ESTÁGIO</th><th className="px-10 py-8 text-right text-[10px] uppercase">AÇÕES</th></tr></thead>
            <tbody>{leads.map((lead) => (<tr key={lead.id} className="hover:bg-white/5 border-b border-[#2A2922] transition-colors"><td className="px-10 py-8 flex items-center gap-6"><div className="w-12 h-12 bg-[#14130E] border border-zinc-800 flex items-center justify-center text-white font-black uppercase italic">{lead.name?.[0]}</div><div><p className="text-lg font-black tracking-widest text-white italic truncate max-w-[200px] uppercase">{lead.name}</p><p className="text-[8px] text-zinc-800 font-bold tracking-[0.5em] mt-1 uppercase">{lead.product_type}</p></div></td><td className="px-10 py-8 text-center"><TempBadge temp={lead.temperature} /></td><td className="px-10 py-8 text-white font-black text-lg uppercase">R$ {Number(lead.faturamento_estimado || 0).toLocaleString()}</td><td className="px-10 py-8"><span className="text-[9px] font-black uppercase py-2 px-6 border border-zinc-900 bg-black text-zinc-600 uppercase">{lead.status?.replace('_', ' ')}</span></td><td className="px-10 py-8 text-right"><button className="text-zinc-800 hover:text-white uppercase"><SettingsIcon size={18} /></button></td></tr>))}</tbody></table></div>
       </div>
       {isModalOpen && <AddLeadModal profile={profile} onClose={() => setIsModalOpen(false)} onAdd={handleAddLead} />}
       {isAnalyzing && (<div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] animate-in fade-in transition-all"><h3 className="text-3xl font-black text-white uppercase italic tracking-tighter uppercase">IA QUALIFICANDO DADOS...</h3></div>)}
    </div>
  )
}

const Kanban = () => {
  const { leads, loading, updateLeadStatus, updateMeetingSchedule, deleteLead } = useLeads()
  const [schedulingLead, setSchedulingLead] = useState<Lead | null>(null)
  const columns = [{ id: 'novo_lead', label: 'NOVO LEAD / INBOX' }, { id: 'iniciou_atendimento', label: 'INICIOU ATENDIMENTO' }, { id: 'conversando', label: 'CONVERSANDO' }, { id: 'aguardando_resposta', label: 'AGUARDANDO RESPOSTA' }, { id: 'follow_up', label: 'FOLLOW UP' }, { id: 'agendamento', label: 'REUNIÃO AGENDADA' }, { id: 'compareceu', label: 'COMPARECEU' }, { id: 'vendido', label: 'VENDIDO' }, { id: 'perdido', label: 'PERDIDO / SEM CONTATO' }]
  const onDragEnd = (result: any) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    const lead = leads.find(l => l.id === draggableId)
    if (!lead) return
    if (destination.droppableId === 'agendamento' && lead.status !== 'agendamento') setSchedulingLead(lead)
    else updateLeadStatus(draggableId, destination.droppableId)
  }
  if (loading) return <div className="text-zinc-800 flex items-center justify-center min-h-[50vh] font-black uppercase animate-pulse">SINCRONIZANDO...</div>
  return (
    <div className="space-y-16 animate-fade-in-up h-full uppercase">
      <h2 className="text-8xl font-black tracking-tighter mb-4 text-white italic uppercase">PIPELINE LINEAR</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-8 overflow-x-auto pb-10 custom-scrollbar px-1 min-h-[850px] items-start uppercase">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided: DroppableProvided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex-shrink-0 w-[380px] flex flex-col gap-8 bg-[#1C1B16]/20 border border-[#2A2922] p-6 pb-20 rounded-none relative transition-all uppercase">
                  <div className="flex items-center gap-4 border-b border-[#2A2922] pb-6 px-2"><div className="w-1 h-8 bg-white uppercase"></div><div className="flex-1"><h3 className="font-black text-white uppercase text-[11px] tracking-widest leading-none uppercase">{column.label}</h3><p className="text-[9px] text-zinc-800 font-bold tracking-widest mt-2 uppercase">{leads.filter(l => l.status === column.id).length} OPORTUNIDADES</p></div></div>
                  <div className="space-y-6 uppercase">
                    {leads.filter(l => l.status === column.id).map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-[#1C1B16] border border-[#2A2922] p-8 rounded-none transition-all duration-300 relative group shadow-xl uppercase ${snapshot.isDragging ? 'dnd-dragging opacity-80 border-white' : 'hover:border-zinc-400'}`}>
                             <div className="flex justify-between items-start mb-6 uppercase"><div className="flex-1 uppercase"><div className="flex gap-2 mb-3 uppercase"><TempBadge temp={lead.temperature} />{lead.status === 'vendido' && <span className="text-[9px] font-black bg-white text-black px-2 py-1 tracking-tighter uppercase">FECHAMENTO</span>}</div><h4 className="text-xl font-black text-white tracking-widest group-hover:text-zinc-200 italic truncate uppercase">{lead.name}</h4></div><span className="text-[10px] font-bold py-1 px-3 bg-black text-zinc-500 uppercase">{lead.ai_score || 0}% IA</span></div>
                             <div className="space-y-4 mb-8 uppercase"><p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-3 uppercase"><Briefcase size={12} className="text-zinc-800" /> {lead.product_type || 'ESTRATÉGIA NÃO DEFINIDA'}</p><p className="text-lg text-white font-black tracking-tighter italic uppercase">R$ {Number(lead.faturamento_estimado || 0).toLocaleString()}</p></div>
                             <div className="border-t border-zinc-900 pt-6 flex justify-between items-center uppercase"><div><p className="text-[8px] text-zinc-800 font-black uppercase mb-1">REGISTRO:</p><p className="text-[10px] text-zinc-600 font-bold italic truncate max-w-[150px] uppercase">{lead.registered_by_name || 'AGENTE STUDIO'}</p></div><div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase"><button onClick={() => deleteLead(lead.id)} className="p-2 text-zinc-800 hover:text-red-500 transition-colors uppercase"><Trash2 size={16} /></button><button className="p-2 text-zinc-800 hover:text-white transition-colors uppercase"><ChevronRight size={16} /></button></div></div>
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
  if (loading) return <div className="text-zinc-900 flex items-center justify-center min-h-[50vh] font-black uppercase anime-pulse">SINCRONIZANDO RADAR...</div>
  return (
    <div className="space-y-16 animate-fade-in-up uppercase">
      <h2 className="text-8xl font-black tracking-tighter mb-4 text-white uppercase italic">RADAR FOLLOW-UP</h2>
      <div className="space-y-6">{followUpLeads.map(lead => (
          <div key={lead.id} className="bg-[#1C1B16] border border-[#2A2922] p-10 flex flex-col md:flex-row items-center gap-12 group transition-all shadow-xl">
             <div className="flex items-center gap-8 min-w-[350px]"><div className="w-20 h-20 bg-[#14130E] border border-zinc-900 flex items-center justify-center text-4xl font-black text-white uppercase">{lead.name?.[0]}</div><div><h4 className="text-3xl font-black text-white tracking-widest italic uppercase">{lead.name}</h4><p className="text-[10px] text-zinc-600 font-black tracking-[0.5em] mt-3 uppercase">FOLLOW-UP DESDE: <span className="text-white uppercase">{formatTimeElapsed(lead.status_changed_at)}</span></p></div></div>
             <div className="flex-1 flex gap-2">{phases.map((phase, i) => (<button key={i} onClick={() => updateFollowUpPhase(lead.id, i + 1)} className={`flex-1 py-6 border transition-all text-[10px] font-black tracking-widest uppercase ${ (lead.follow_up_phase || 0) >= i + 1 ? 'bg-white text-black border-white' : 'bg-transparent border-[#2A2922] text-zinc-800 hover:text-white uppercase' }`}>{ (lead.follow_up_phase || 0) > i + 1 ? <CheckCircle2 size={16} className="mx-auto" /> : <span>{i + 1} {phase.title}</span> }</button>))}</div>
             <div className="flex gap-4"><button onClick={() => updateLeadStatus(lead.id, 'compareceu')} className="bg-white text-black p-5 hover:bg-zinc-200 transition-all uppercase"><UserCheck size={20} /></button><button onClick={() => { if(confirm('Remover?')) deleteLead(lead.id) }} className="bg-black text-zinc-800 p-5 border border-zinc-900 hover:text-red-500 transition-all uppercase"><Trash2 size={20} /></button></div>
          </div>
        ))}{followUpLeads.length === 0 && <div className="py-40 text-center text-[11px] font-black uppercase text-zinc-900 tracking-[1em]">RADAR SINCRONIZADO.</div>}</div>
    </div>
  )
}

const Agenda = () => {
  const { leads, loading } = useLeads()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const meetings = leads.filter(l => l.meeting_date)
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(currentMonth)), end: endOfWeek(endOfMonth(currentMonth)) })
  if (loading) return <div className="text-zinc-800 flex items-center justify-center min-h-[50vh] font-black uppercase animate-pulse">SINCRONIZANDO...</div>
  return (
    <div className="space-y-16 animate-fade-in-up uppercase">
       <div className="flex items-center justify-between"><div><h2 className="text-8xl font-black tracking-tighter mb-4 text-white italic uppercase">AGENDA STUDIO</h2><p className="text-[11px] text-zinc-600 uppercase tracking-[0.6em]">SINCRONIZAÇÃO DE ATENDIMENTOS UNICO STUDIO.</p></div>
         <div className="flex items-center gap-8 bg-[#1C1B16] border border-[#2A2922] p-5 text-white font-black text-xs tracking-widest italic uppercase"><button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="hover:text-zinc-400 transition-colors uppercase"><ChevronRight size={20} className="rotate-180" /></button><span>{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span><button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="hover:text-zinc-400 transition-colors uppercase"><ChevronRight size={20} /></button></div></div>
       <div className="grid grid-cols-7 border border-[#2A2922] bg-[#1C1B16]/20 uppercase">
         {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(d => (<div key={d} className="p-6 text-center text-[10px] font-black text-zinc-700 border-b border-[#2A2922] tracking-[1em] uppercase">{d}</div>))}
         {days.map((day: Date, i: number) => {
           const dayMeetings = meetings.filter(m => isSameDay(new Date(m.meeting_date!), day))
           return (
             <div key={i} className={`min-h-[180px] p-4 border-[#2A2922] ${i % 7 !== 6 ? 'border-r' : ''} border-b relative ${!isSameMonth(day, currentMonth) ? 'opacity-20' : ''}`}>
               <span className={`text-[10px] font-black ${isSameDay(day, new Date()) ? 'text-white' : 'text-zinc-800'} uppercase`}>{format(day, 'd')}</span>
               <div className="mt-4 space-y-2">{dayMeetings.map((m, j) => (<div key={j} className="bg-white text-black p-4 text-[9px] font-black tracking-tighter leading-tight flex flex-col gap-1 border-l-4 border-zinc-500 shadow-xl uppercase"><span className="text-[8px] opacity-60 uppercase">{m.meeting_time}H</span><span className="truncate uppercase">{m.name}</span></div>))}</div>
             </div>
           )
         })}
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
    alert('Ajustes Sincronizados.')
  }
  if (!formData) return <div className="text-zinc-800 flex items-center justify-center min-h-[50vh] font-black uppercase text-[10px]">CARREGANDO...</div>
  return (
    <div className="space-y-16 animate-fade-in-up uppercase">
       <div><h2 className="text-8xl font-black tracking-tighter mb-4 text-white italic uppercase">AJUSTES ELITE</h2><p className="text-[11px] text-zinc-600 uppercase tracking-[0.5em] font-light">GERENCIE SEU PERFIL PROFISSIONAL NO UNICO STUDIO.</p></div>
       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-16 uppercase">
          <div className="bg-[#1C1B16] border border-[#2A2922] p-12 space-y-10 shadow-2xl uppercase">
              <div className="space-y-2 border-b border-[#2A2922] pb-6 mb-10 uppercase"><h3 className="text-xl font-black text-white italic tracking-tighter uppercase">DADOS PESSOAIS</h3></div>
              <div className="space-y-6 uppercase">
                <div className="space-y-2 uppercase"><label className="text-[10px] font-black text-zinc-500 tracking-[0.2em] flex items-center gap-3 lowercase uppercase"><User size={14} /> NOME DO OPERADOR</label><input className="w-full bg-[#14130E] border border-[#2A2922] p-5 text-white text-xs font-black outline-none focus:border-white transition-all uppercase" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} /></div>
                <div className="space-y-2 opacity-50 uppercase"><label className="text-[10px] font-black text-zinc-500 tracking-[0.2em] flex items-center gap-3 lowercase uppercase"><Briefcase size={14} /> CARGO ATUAL (VIA ADMIN)</label><input className="w-full bg-transparent border border-[#2A2922] p-5 text-zinc-600 text-xs font-black outline-none cursor-not-allowed uppercase" value={profile?.role} readOnly /></div>
                <div className="space-y-2 uppercase"><label className="text-[10px] font-black text-zinc-500 tracking-[0.2em] flex items-center gap-3 lowercase uppercase"><Tag size={14} /> TAG IDENTIFICADORA</label><input className="w-full bg-[#14130E] border border-[#2A2922] p-5 text-white text-xs font-black outline-none focus:border-white transition-all uppercase" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} /></div>
              </div>
          </div>
          <div className="flex flex-col gap-12 uppercase">
             <div className="bg-[#1C1B16] border border-[#2A2922] p-12 space-y-10 shadow-2xl uppercase">
                <div className="space-y-2 border-b border-[#2A2922] pb-6 mb-10 uppercase"><h3 className="text-xl font-black text-white italic tracking-tighter uppercase">LINHAS DE CONTATO</h3></div>
                <div className="space-y-6 uppercase">
                   <div className="space-y-2 uppercase"><label className="text-[10px] font-black text-zinc-500 tracking-[0.2em] flex items-center gap-3 lowercase uppercase"><Phone size={14} /> WHATSAPP</label><input className="w-full bg-[#14130E] border border-[#2A2922] p-5 text-white text-xs font-black outline-none focus:border-white transition-all uppercase" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} /></div>
                   <div className="space-y-2 uppercase"><label className="text-[10px] font-black text-zinc-500 tracking-[0.2em] flex items-center gap-3 lowercase uppercase"><Smartphone size={14} /> WHATSAPP COMERCIAL</label><input className="w-full bg-[#14130E] border border-[#2A2922] p-5 text-white text-xs font-black outline-none focus:border-white transition-all uppercase" value={formData.whatsapp_business} onChange={e => setFormData({...formData, whatsapp_business: e.target.value})} /></div>
                </div>
             </div>
             <button type="submit" className="bg-white text-black p-8 font-black text-xs uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all shadow-xl active:scale-95 uppercase">SALVAR AJUSTES STUDIO</button>
          </div>
       </form>
    </div>
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
    <Router><AuthGuard session={session} profile={profile} loading={loading} onSignOut={() => supabase.auth.signOut()}>
        <Routes><Route path="/" element={<DashboardUnified profile={profile} />} /><Route path="/admin" element={<AdminDashboard />} /><Route path="/admin/management" element={<AdminManagement />} /><Route path="/leads" element={<Leads />} /><Route path="/kanban" element={<Kanban />} /><Route path="/follow-up" element={<FollowUp />} /><Route path="/appointments" element={<Agenda />} /><Route path="/tasks" element={<Tasks profile={profile} />} /><Route path="/settings" element={<Settings profile={profile} onUpdate={handleUpdateProfile} />} /><Route path="*" element={<DashboardUnified profile={profile} />} /></Routes>
    </AuthGuard></Router>
  )
}
export default App
