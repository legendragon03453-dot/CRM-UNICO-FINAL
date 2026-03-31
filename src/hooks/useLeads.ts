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
  created_at: string
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
      .insert([lead])
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
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Error updating lead status:', error)
    }
  }

  useEffect(() => {
    fetchLeads()

    // Subscribe to realtime changes
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

  return { leads, loading, fetchLeads, addLead, updateLeadStatus }
}
