'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useDashboardData } from '@/hooks/useDashboardData'
import { LineChart, DonutChart } from '@/components/Charts'

type PeriodDays = 7 | 30 | 90 | 365

export default function DashboardPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [period, setPeriod] = useState<PeriodDays>(30)
  const { stats, loading: statsLoading } = useDashboardData(period)

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated || !user) return null

  const categoryData = Object.entries(stats.expensesByCategory).map(([label, value]) => ({ label, value }))
  const trendData = Object.entries(stats.expenseByMonth).map(([label, value]) => ({ label, value }))

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Pierre</h1>
            <p className="text-zinc-400">Bem-vindo, {user?.name}!</p>
          </div>
          <button
            onClick={() => logout()}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Period Filter */}
        <div className="flex gap-2 mb-6">
          {([7, 30, 90, 365] as const).map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days as PeriodDays)}
              className={`px-4 py-2 rounded-lg transition ${
                period === days ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {days === 7 ? '7d' : days === 30 ? '30d' : days === 90 ? '90d' : '1a'}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-400 text-sm mb-2">Receita</p>
            <p className="text-3xl font-bold text-emerald-400">R$ {stats.totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-400 text-sm mb-2">Gastos</p>
            <p className="text-3xl font-bold text-red-400">R$ {stats.totalExpense.toFixed(2)}</p>
          </div>
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-400 text-sm mb-2">Saldo</p>
            <p className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {stats.balance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Charts */}
        {!statsLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {categoryData.length > 0 && (
              <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
                <DonutChart data={categoryData} title="Despesas por Categoria" />
              </div>
            )}
            {trendData.length > 0 && (
              <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
                <LineChart data={trendData} title="Gastos por Mês" />
              </div>
            )}
          </div>
        )}

        {/* Recent Transactions */}
        <section className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Transações Recentes</h2>
          {stats.recentTransactions.length === 0 ? (
            <p className="text-zinc-400">Nenhuma transação</p>
          ) : (
            <div className="space-y-3">
              {stats.recentTransactions.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-[#09090b] rounded-lg">
                  <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-sm text-zinc-400">{t.category}</p>
                  </div>
                  <p className={`font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'} R$ {Math.abs(t.value).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
