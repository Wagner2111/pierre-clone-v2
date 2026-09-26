'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { mockTransactions, mockStats, mockCategories } from '@/lib/mockData'

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('user')
    if (!stored) {
      router.push('/auth/login')
    } else {
      setUser(JSON.parse(stored))
    }
  }, [router])

  const logout = () => {
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  if (!mounted || !user) return null

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Pierre</h1>
            <p className="text-zinc-400">Bem-vindo, {user?.name || 'Wagner'}!</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-400 text-sm mb-2">Gasto em Setembro</p>
            <p className="text-3xl font-bold">R$ {mockStats.gastoSetembro.toFixed(2)}</p>
          </div>
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-400 text-sm mb-2">Comparação</p>
            <p className="text-3xl font-bold text-red-400">{mockStats.comparacaoAnterior}%</p>
          </div>
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-400 text-sm mb-2">Maior Gasto</p>
            <p className="text-2xl font-bold">{mockStats.maiorGasto}</p>
          </div>
        </div>

        {/* Transactions */}
        <section className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Transações Recentes</h2>
          <div className="space-y-3">
            {mockTransactions.map((t) => (
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
        </section>

        {/* Categories */}
        <section className="bg-[#101012] border border-zinc-800 rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Gastos por Categoria</h2>
          <div className="space-y-3">
            {mockCategories.map((c) => (
              <div key={c.name} className="flex justify-between items-center">
                <p className="text-zinc-400">{c.name}</p>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-zinc-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${c.percentage}%` }}></div>
                  </div>
                  <p className="text-right w-20">R$ {c.value.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
