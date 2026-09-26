'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface Transaction {
  id: number
  description: string
  category: string
  value: number
  type: string
  date: string
}

interface ReportData {
  month: string
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: { [key: string]: number }
  topExpenses: Transaction[]
  transactions: Transaction[]
}

export function useReports(month?: string) {
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        const currentMonth = month || new Date().toISOString().slice(0, 7)
        const transactions = await apiClient.getTransactions()

        const monthStart = new Date(`${currentMonth}-01`)
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

        const filtered = transactions.filter((t: Transaction) => {
          const txDate = new Date(t.date)
          return txDate >= monthStart && txDate <= monthEnd
        })

        let totalIncome = 0
        let totalExpense = 0
        const byCategory: { [key: string]: number } = {}

        filtered.forEach((tx: Transaction) => {
          if (tx.type === 'income') {
            totalIncome += tx.value
          } else {
            totalExpense += tx.value
            byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.value
          }
        })

        const topExpenses = filtered
          .filter((t: Transaction) => t.type === 'expense')
          .sort((a: Transaction, b: Transaction) => b.value - a.value)
          .slice(0, 5)

        setReport({
          month: currentMonth,
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          byCategory,
          topExpenses,
          transactions: filtered
        })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [month])

  const exportToCSV = () => {
    if (!report) return

    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']
    const rows = report.transactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.type,
      `R$ ${t.value.toFixed(2)}`
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio-${report.month}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    if (!report) return

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório ${report.month}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
          .summary { display: flex; gap: 20px; margin: 20px 0; }
          .card { flex: 1; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .card h3 { margin: 0 0 10px 0; color: #666; }
          .card .value { font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f0f0f0; padding: 10px; text-align: left; border-bottom: 2px solid #333; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
        </style>
      </head>
      <body>
        <h1>Relatório de Finanças - ${report.month}</h1>

        <div class="summary">
          <div class="card">
            <h3>Receita</h3>
            <div class="value positive">R$ ${report.totalIncome.toFixed(2)}</div>
          </div>
          <div class="card">
            <h3>Despesa</h3>
            <div class="value negative">R$ ${report.totalExpense.toFixed(2)}</div>
          </div>
          <div class="card">
            <h3>Saldo</h3>
            <div class="value ${report.balance >= 0 ? 'positive' : 'negative'}">
              R$ ${report.balance.toFixed(2)}
            </div>
          </div>
        </div>

        <h2>Despesas por Categoria</h2>
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Valor</th>
              <th>% do Total</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(report.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(
                ([category, value]) => `
              <tr>
                <td>${category}</td>
                <td>R$ ${value.toFixed(2)}</td>
                <td>${((value / report.totalExpense) * 100).toFixed(1)}%</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <h2>Todas as Transações</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${report.transactions
              .map(
                t => `
              <tr>
                <td>${t.date}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td>${t.type === 'income' ? 'Receita' : 'Despesa'}</td>
                <td class="${t.type === 'income' ? 'positive' : 'negative'}">
                  ${t.type === 'income' ? '+' : '-'} R$ ${t.value.toFixed(2)}
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <script>
          window.print();
        </script>
      </body>
      </html>
    `

    const newWindow = window.open('', '', 'width=800,height=600')
    if (newWindow) {
      newWindow.document.write(html)
      newWindow.document.close()
    }
  }

  return { report, loading, error, exportToCSV, exportToPDF }
}
