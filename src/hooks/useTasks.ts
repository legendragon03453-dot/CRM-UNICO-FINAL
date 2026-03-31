import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface Task {
  id: string
  title: string
  description?: string
  assigned_to: string // Fixed column name
  created_by?: string
  status: 'pending' | 'completed' | 'overdue'
  created_at: string
}

export const useTasks = (assigneeId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      let query = supabase.from('tasks').select('*')
      // Fixed column name for filtering
      if (assigneeId) query = query.eq('assigned_to', assigneeId)
      
      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (task: Partial<Task>) => {
    // Ensure we use assigned_to instead of assignee_id if passed
    const taskData = { ...task } as any;
    if (taskData.assignee_id) {
      taskData.assigned_to = taskData.assignee_id;
      delete taskData.assignee_id;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
    if (error) {
      console.error('Error adding task:', error)
      return null
    }
    return data[0]
  }

  const updateTaskStatus = async (id: string, status: 'pending' | 'completed') => {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id)
    if (error) console.error('Error updating task:', error)
  }

  useEffect(() => {
    fetchTasks()
    const channel = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks((prev) => [payload.new as Task, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setTasks((prev) => prev.map((t) => (t.id === payload.new.id ? { ...t, ...payload.new } : t)))
        } else if (payload.eventType === 'DELETE') {
          setTasks((prev) => prev.filter((t) => t.id === payload.old.id))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [assigneeId])

  return { tasks, loading, addTask, updateTaskStatus, fetchTasks }
}
