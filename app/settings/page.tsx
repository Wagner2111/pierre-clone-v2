'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { apiClient } from '@/lib/api'

interface Category {
  id: number
  name: string
  color: string
  icon: string
}

interface Tag {
  id: number
  name: string
  color: string
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
const ICONS = ['📁', '💰', '🛍️', '🍔', '🚗', '🏠', '📱', '✈️', '⚕️', '📚']

export default function SettingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [catName, setCatName] = useState('')
  const [catColor, setCatColor] = useState(COLORS[0])
  const [catIcon, setCatIcon] = useState(ICONS[0])
  const [tagName, setTagName] = useState('')
  const [tagColor, setTagColor] = useState(COLORS[1])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/auth/login')
    } else {
      loadData()
    }
  }, [isAuthenticated, authLoading, router])

  const loadData = async () => {
    try {
      const [cats, tgs] = await Promise.all([
        apiClient.getCategories(),
        apiClient.getTags()
      ])
      setCategories(cats)
      setTags(tgs)
    } catch (err) {
      console.error('Failed to load data:', err)
    }
  }

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName) return
    try {
      await apiClient.createCategory(catName, catColor, catIcon)
      setCatName('')
      setCatColor(COLORS[0])
      setCatIcon(ICONS[0])
      loadData()
    } catch (err) {
      console.error('Failed to add category:', err)
    }
  }

  const addTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagName) return
    try {
      await apiClient.createTag(tagName, tagColor)
      setTagName('')
      setTagColor(COLORS[1])
      loadData()
    } catch (err) {
      console.error('Failed to add tag:', err)
    }
  }

  if (authLoading || !isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-zinc-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-zinc-400">Personalize categorias e tags</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Categorias Customizadas</h2>

          <form onSubmit={addCategory} className="bg-[#101012] border border-zinc-800 rounded-lg p-4 space-y-3">
            <input
              type="text"
              placeholder="Nome da categoria"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
            />
            <div className="flex gap-2">
              <select
                value={catIcon}
                onChange={(e) => setCatIcon(e.target.value)}
                className="px-3 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
              >
                {ICONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setCatColor(color)}
                    className={`w-8 h-8 rounded border-2 ${catColor === color ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button type="submit" className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-700">
                Adicionar
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map(cat => (
              <div key={cat.id} className="bg-[#101012] border border-zinc-800 rounded-lg p-3 flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }} />
                </span>
                <button
                  onClick={() => {
                    apiClient.deleteCategory(cat.id).then(() => loadData())
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Tags</h2>

          <form onSubmit={addTag} className="bg-[#101012] border border-zinc-800 rounded-lg p-4 space-y-3">
            <input
              type="text"
              placeholder="Nome da tag"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
            />
            <div className="flex gap-2">
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setTagColor(color)}
                    className={`w-8 h-8 rounded border-2 ${tagColor === color ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button type="submit" className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-700">
                Adicionar
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <div
                key={tag.id}
                className="px-3 py-1 rounded-full text-sm text-white flex items-center gap-2"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <button
                  onClick={() => {
                    apiClient.deleteTag(tag.id).then(() => loadData())
                  }}
                  className="hover:opacity-70"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
