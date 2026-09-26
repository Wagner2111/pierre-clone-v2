'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface RecurringTransaction {
  id: number
  user_id: number
  description: string
  category: string
  value: number
  type: string
  frequency: string
  start_date: string
  end_date?: string
  is_active: number
  created_at: string
}

export function useRecurring() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecurring = async () => {
      try {
        setLoading(true)
        const data = await apiClient.getRecurring()
        setRecurring(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recurring')
      } finally {
        setLoading(false)
      }
    }

    fetchRecurring()
  }, [])

  const addRecurring = async (
    description: string,
    category: string,
    value: number,
    type: string,
    frequency: string,
    start_date: string,
    end_date?: string
  ) => {
    try {
      const newRecurring = await apiClient.createRecurring(
        description,
        category,
        value,
        type,
        frequency,
        start_date,
        end_date
      )
      setRecurring([newRecurring, ...recurring])
      return newRecurring
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create recurring')
    }
  }

  const toggleRecurring = async (id: number, is_active: boolean) => {
    try {
      await apiClient.updateRecurring(id, is_active)
      setRecurring(
        recurring.map((r) =>
          r.id === id ? { ...r, is_active: is_active ? 1 : 0 } : r
        )
      )
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update recurring')
    }
  }

  const deleteRecurring = async (id: number) => {
    try {
      await apiClient.deleteRecurring(id)
      setRecurring(recurring.filter((r) => r.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete recurring')
    }
  }

  const getNextOccurrence = (transaction: RecurringTransaction): string => {
    const start = new Date(transaction.start_date)
    const today = new Date()
    let next = new Date(start)

    while (next <= today) {
      if (transaction.frequency === 'daily') {
        next.setDate(next.getDate() + 1)
      } else if (transaction.frequency === 'weekly') {
        next.setDate(next.getDate() + 7)
      } else if (transaction.frequency === 'monthly') {
        next.setMonth(next.getMonth() + 1)
      } else if (transaction.frequency === 'yearly') {
        next.setFullYear(next.getFullYear() + 1)
      }
    }

    if (transaction.end_date) {
      const end = new Date(transaction.end_date)
      if (next > end) return 'Expirado'
    }

    return next.toLocaleDateString('pt-BR')
  }

  return { recurring, loading, error, addRecurring, toggleRecurring, deleteRecurring, getNextOccurrence }
}
