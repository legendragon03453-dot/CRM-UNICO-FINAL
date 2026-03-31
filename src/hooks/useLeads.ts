import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface Lead {
  id: string
  name: string
  instagram?: string
  whatsapp?: string
  faturamento_estimado?: number
  dia?: string
  horario?: string
  status: string
  ai_score?: number
  ai_tags?: string[]
  ai_summary?: string
  owner_id?: string
  registered_by_name?: string
  status_changed_at?: string
  last_activity: string
  created_at: string
  follow_up_phase?: number
  product_type?: string
  temperature?: 'frio' | 'morno' | 'quente'
  meeting_date?: string
  meeting_time?: string
}

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const addLead = async (lead: Partial<Lead>) => {
    const { data, error } = await supabase
      .from('leads')
      .insert([{ 
        ...lead, 
        status_changed_at: new Date().toISOString(), 
        follow_up_phase: 0,
        temperature: lead.temperature || 'frio'
      }])
      .select()

    if (error) {
      console.error('Error adding lead:', error)
      return null
    }
    return data[0]
  }

  const updateLeadStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status, status_changed_at: new Date().toISOString() })
      .eq('id', id)

    if (error) console.error('Error updating lead status:', error)
  }

  const updateMeetingSchedule = async (id: string, date: string, time: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ 
        meeting_date: date, 
        meeting_time: time,
        status: 'agendamento' // Sincroniza com Reunião Agendada
      })
      .eq('id', id)
    if (error) console.error('Error scheduling meeting:', error)
  }

  const updateFollowUpPhase = async (id: string, phase: number) => {
    const { error } = await supabase
      .from('leads')
      .update({ follow_up_phase: phase })
      .eq('id', id)
    if (error) console.error('Error updating follow-up phase:', error)
  }

  const deleteLead = async (id: string) => {
    try {
      // 1. Clear associated appointments first to avoid FK constraint error
      await supabase.from('appointments').delete().eq('lead_id', id)
      
      // 2. Delete the lead
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error deleting lead:', error)
      alert('Erro ao remover lead: Verifique permissões ou dados vinculados.')
    }
  }

  useEffect(() => {
    fetchLeads()
    const channel = supabase
      .channel('leads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLeads((prev) => [payload.new as Lead, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setLeads((prev) => prev.map((l) => (l.id === payload.new.id ? { ...l, ...payload.new } : l)))
        } else if (payload.eventType === 'DELETE') {
          setLeads((prev) => prev.filter((l) => l.id === payload.old.id))
        }
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { leads, loading, fetchLeads, addLead, updateLeadStatus, updateFollowUpPhase, deleteLead, updateMeetingSchedule }
}
