'use client'

export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const userData = { email, name: email.split('@')[0] }
      localStorage.setItem('user', JSON.stringify(userData))
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [email, router])

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
      <div className="w-full max-w-md px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo!</h1>
        <p className="text-zinc-400 mb-8">Faça login na sua conta Pierre</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-zinc-400 mt-6">
          Não tem conta?{' '}
          <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300">
            Registre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
