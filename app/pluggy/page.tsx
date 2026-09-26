'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { apiClient } from '@/lib/api'

interface PluggyAccount {
  pluggy_id: string
  pluggy_name: string
  bank_name: string
}

export default function PluggyPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [accounts, setAccounts] = useState<PluggyAccount[]>([])
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/auth/login')
    } else {
      loadAccounts()
    }
  }, [isAuthenticated, authLoading, router])

  const loadAccounts = async () => {
    try {
      const data = await apiClient.getPluggyAccounts()
      setAccounts(data)
    } catch (err) {
      console.error('Failed to load accounts:', err)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await apiClient.syncPluggyTransactions()
      alert('Transações sincronizadas com sucesso!')
      loadAccounts()
    } catch (err) {
      console.error('Sync failed:', err)
      alert('Falha ao sincronizar transações')
    } finally {
      setSyncing(false)
    }
  }

  const handleConnect = () => {
    window.open('https://secure.pluggy.ai/connect', '_blank', 'width=800,height=600')
  }

  if (authLoading || !isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-zinc-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Pluggy - Integração Bancária</h1>
          <p className="text-zinc-400">Conecte suas contas bancárias reais</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex gap-4">
          <button
            onClick={handleConnect}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
          >
            + Conectar Conta Bancária
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`px-6 py-3 rounded-lg font-medium ${
              syncing
                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar Transações'}
          </button>
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-4">Contas Conectadas</h2>
          {accounts.length === 0 ? (
            <div className="bg-[#101012] border border-zinc-800 rounded-lg p-8 text-center text-zinc-400">
              <p>Nenhuma conta conectada</p>
              <p className="text-sm mt-2">Clique em "Conectar Conta Bancária" para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((account) => (
                <div
                  key={account.pluggy_id}
                  className="bg-[#101012] border border-zinc-800 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-lg">{account.bank_name}</h3>
                  <p className="text-zinc-400 text-sm mt-1">{account.pluggy_name}</p>
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm">
                      Sincronizar
                    </button>
                    <button className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-sm">
                      Desconectar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-[#101012] border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Como Funciona</h2>
          <div className="space-y-3 text-zinc-300">
            <p>✅ Conecte suas contas bancárias reais via Pluggy</p>
            <p>✅ Importe transações automaticamente</p>
            <p>✅ Dados criptografados, credenciais não armazenadas</p>
          </div>
        </section>
      </main>
    </div>
  )
}
