'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface Transaction {
  id: number
  user_id: number
  description: string
  category: string
  value: number
  type: string
  date: string
  created_at: string
}

interface DashboardStats {
  totalIncome: number
  totalExpense: number
  balance: number
  expensesByCategory: { [key: string]: number }
  incomeByMonth: { [key: string]: number }
  expenseByMonth: { [key: string]: number }
  recentTransactions: Transaction[]
}

export function useDashboardData(days: number = 30) {
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    expensesByCategory: {},
    incomeByMonth: {},
    expenseByMonth: {},
    recentTransactions: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const transactions = await apiClient.getTransactions()

        const now = new Date()
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

        const filtered = transactions.filter((t: Transaction) => {
          const txDate = new Date(t.date)
          return txDate >= cutoffDate
        })

        let totalIncome = 0
        let totalExpense = 0
        const expensesByCategory: { [key: string]: number } = {}
        const incomeByMonth: { [key: string]: number } = {}
        const expenseByMonth: { [key: string]: number } = {}

        filtered.forEach((tx: Transaction) => {
          const month = new Date(tx.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })

          if (tx.type === 'income') {
            totalIncome += tx.value
            incomeByMonth[month] = (incomeByMonth[month] || 0) + tx.value
          } else {
            totalExpense += tx.value
            expenseByMonth[month] = (expenseByMonth[month] || 0) + tx.value
            expensesByCategory[tx.category] = (expensesByCategory[tx.category] || 0) + tx.value
          }
        })

        setStats({
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          expensesByCategory,
          incomeByMonth,
          expenseByMonth,
          recentTransactions: filtered.slice(0, 5)
        })

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [days])

  return { stats, loading, error }
}
