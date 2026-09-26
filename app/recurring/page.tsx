'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useRecurring } from '@/hooks/useRecurring'

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export default function RecurringPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [value, setValue] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [frequency, setFrequency] = useState<Frequency>('monthly')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const { recurring, addRecurring, toggleRecurring, deleteRecurring, getNextOccurrence } = useRecurring()

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading || !isAuthenticated || !user) return null

  const handleAddRecurring = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !category || !value) return

    try {
      await addRecurring(description, category, parseFloat(value), type, frequency, startDate, endDate || undefined)
      setDescription('')
      setCategory('')
      setValue('')
      setType('expense')
      setFrequency('monthly')
      setStartDate(new Date().toISOString().split('T')[0])
      setEndDate('')
    } catch (err) {
      console.error('Failed to add recurring:', err)
    }
  }

  const frequencyLabels: Record<Frequency, string> = {
    daily: 'Diariamente',
    weekly: 'Semanalmente',
    monthly: 'Mensalmente',
    yearly: 'Anualmente'
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Transações Recorrentes</h1>
          <p className="text-zinc-400">Configure despesas e receitas que se repetem automaticamente</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Add Form */}
        <section className="bg-[#101012] border border-zinc-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Adicionar Transação Recorrente</h2>
          <form onSubmit={handleAddRecurring} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
              />
              <input
                type="text"
                placeholder="Categoria"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
              />
              <input
                type="number"
                placeholder="Valor"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                step="0.01"
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
              >
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
                <option value="yearly">Anualmente</option>
              </select>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
              />
              <input
                type="date"
                placeholder="Data final (opcional)"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Adicionar
            </button>
          </form>
        </section>

        {/* Recurring Transactions List */}
        <section className="space-y-3">
          {recurring.length === 0 ? (
            <p className="text-zinc-400">Nenhuma transação recorrente configurada</p>
          ) : (
            recurring.map((tx) => (
              <div
                key={tx.id}
                className="bg-[#101012] border border-zinc-800 rounded-lg p-4 flex justify-between items-start"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{tx.description}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${tx.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {tx.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">
                    {tx.category} • {frequencyLabels[tx.frequency as Frequency]}
                  </p>
                  <p className={`text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'} R$ {tx.value.toFixed(2)} • Próximo: {getNextOccurrence(tx)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleRecurring(tx.id, tx.is_active === 0)}
                    className={`px-3 py-1 rounded text-sm ${tx.is_active ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                  >
                    {tx.is_active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => deleteRecurring(tx.id)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  )
}
