'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useReports } from '@/hooks/useReports'

export default function ReportsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const { report, loading, error, exportToCSV, exportToPDF } = useReports(month)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading || !isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-zinc-400">Visualize e exporte seus dados financeiros</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
          />
          <button
            onClick={exportToCSV}
            disabled={!report}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600"
          >
            📊 Exportar CSV
          </button>
          <button
            onClick={exportToPDF}
            disabled={!report}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-600"
          >
            📄 Imprimir/PDF
          </button>
        </div>

        {/* Loading/Error States */}
        {loading && <p className="text-zinc-400">Carregando relatório...</p>}
        {error && <p className="text-red-400">Erro: {error}</p>}

        {/* Report Summary */}
        {report && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm mb-2">Receita</p>
                <p className="text-3xl font-bold text-emerald-400">R$ {report.totalIncome.toFixed(2)}</p>
              </div>
              <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm mb-2">Despesa</p>
                <p className="text-3xl font-bold text-red-400">R$ {report.totalExpense.toFixed(2)}</p>
              </div>
              <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm mb-2">Saldo</p>
                <p className={`text-3xl font-bold ${report.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  R$ {report.balance.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Expenses by Category */}
            {Object.keys(report.byCategory).length > 0 && (
              <section className="bg-[#101012] border border-zinc-800 rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Despesas por Categoria</h2>
                <div className="space-y-3">
                  {Object.entries(report.byCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, value]) => (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-300">{category}</span>
                          <span className="text-zinc-400">R$ {value.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${(value / report.totalExpense) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                          {((value / report.totalExpense) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Top Expenses */}
            {report.topExpenses.length > 0 && (
              <section className="bg-[#101012] border border-zinc-800 rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Top 5 Maiores Despesas</h2>
                <div className="space-y-3">
                  {report.topExpenses.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center p-3 bg-[#09090b] rounded-lg">
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-zinc-400">{tx.category}</p>
                      </div>
                      <p className="font-semibold text-red-400">- R$ {tx.value.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* All Transactions */}
            <section className="bg-[#101012] border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Todas as Transações ({report.transactions.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-700">
                      <th className="text-left py-2 px-4 text-zinc-400">Data</th>
                      <th className="text-left py-2 px-4 text-zinc-400">Descrição</th>
                      <th className="text-left py-2 px-4 text-zinc-400">Categoria</th>
                      <th className="text-left py-2 px-4 text-zinc-400">Tipo</th>
                      <th className="text-right py-2 px-4 text-zinc-400">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-zinc-800 hover:bg-[#131315]">
                        <td className="py-2 px-4">{tx.date}</td>
                        <td className="py-2 px-4">{tx.description}</td>
                        <td className="py-2 px-4">{tx.category}</td>
                        <td className="py-2 px-4">
                          <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}>
                            {tx.type === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td className={`py-2 px-4 text-right font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.type === 'income' ? '+' : '-'} R$ {tx.value.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
