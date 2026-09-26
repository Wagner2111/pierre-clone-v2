'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface Budget {
  id: number
  user_id: number
  category: string
  limit: number
  month: string
  created_at: string
}

interface BudgetWithUsed extends Budget {
  used: number
  remaining: number
  percentage: number
}

interface Transaction {
  category: string
  value: number
  type: string
}

export function useBudgets(month?: string, transactions: Transaction[] = []) {
  const [budgets, setBudgets] = useState<BudgetWithUsed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true)
        const currentMonth = month || new Date().toISOString().slice(0, 7)
        const data = await apiClient.getBudgets(currentMonth)

        const budgetsWithUsed = data.map((budget: Budget) => {
          const used = transactions
            .filter(
              t =>
                t.category === budget.category &&
                t.type === 'expense'
            )
            .reduce((sum, t) => sum + t.value, 0)

          const remaining = budget.limit - used
          const percentage = Math.min((used / budget.limit) * 100, 100)

          return { ...budget, used, remaining, percentage }
        })

        setBudgets(budgetsWithUsed)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load budgets')
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [month, transactions])

  const addBudget = async (category: string, limit: number) => {
    try {
      const currentMonth = month || new Date().toISOString().slice(0, 7)
      const newBudget = await apiClient.createBudget(category, limit, currentMonth)
      setBudgets([...budgets, { ...newBudget, used: 0, remaining: limit, percentage: 0 }])
      return newBudget
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create budget')
    }
  }

  const deleteBudget = async (id: number) => {
    try {
      await apiClient.deleteBudget(id)
      setBudgets(budgets.filter(b => b.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete budget')
    }
  }

  const isOverBudget = (budget: BudgetWithUsed) => budget.remaining < 0
  const getAlertLevel = (budget: BudgetWithUsed) => {
    if (isOverBudget(budget)) return 'over'
    if (budget.percentage >= 80) return 'warning'
    if (budget.percentage >= 50) return 'caution'
    return 'ok'
  }

  return { budgets, loading, error, addBudget, deleteBudget, isOverBudget, getAlertLevel }
}
