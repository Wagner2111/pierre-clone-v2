'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useBudgets } from '@/hooks/useBudgets'
import { BudgetCard } from '@/components/BudgetCard'

export default function BudgetsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [newCategory, setNewCategory] = useState('')
  const [newLimit, setNewLimit] = useState('')
  const { stats } = useDashboardData(30)
  const { budgets, addBudget, deleteBudget, getAlertLevel } = useBudgets(month, stats.recentTransactions)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading || !isAuthenticated || !user) return null

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory || !newLimit) return

    try {
      await addBudget(newCategory, parseFloat(newLimit))
      setNewCategory('')
      setNewLimit('')
    } catch (err) {
      console.error('Failed to add budget:', err)
    }
  }

  const overBudgetCount = budgets.filter(b => b.remaining < 0).length
  const warningCount = budgets.filter(b => b.percentage >= 80 && b.remaining >= 0).length

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          <p className="text-zinc-400">Gerencie seus limites de gastos por categoria</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Alerts */}
        {(overBudgetCount > 0 || warningCount > 0) && (
          <div className="space-y-3 mb-6">
            {overBudgetCount > 0 && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400 font-semibold">
                  ⚠️ {overBudgetCount} categoria(s) ultrapassou o orçamento!
                </p>
              </div>
            )}
            {warningCount > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-4">
                <p className="text-orange-400">
                  🔔 {warningCount} categoria(s) próxima ao limite (80%+)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Month Selector */}
        <div className="mb-6">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
          />
        </div>

        {/* Add Budget Form */}
        <section className="bg-[#101012] border border-zinc-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Adicionar Orçamento</h2>
          <form onSubmit={handleAddBudget} className="flex gap-3">
            <input
              type="text"
              placeholder="Categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
            />
            <input
              type="number"
              placeholder="Limite (R$)"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              step="0.01"
              className="w-32 px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Adicionar
            </button>
          </form>
        </section>

        {/* Budgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.length === 0 ? (
            <p className="text-zinc-400 col-span-full">Nenhum orçamento criado para este mês</p>
          ) : (
            budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                category={budget.category}
                limit={budget.limit}
                used={budget.used}
                remaining={budget.remaining}
                percentage={budget.percentage}
                alertLevel={getAlertLevel(budget)}
                onDelete={() => deleteBudget(budget.id)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
