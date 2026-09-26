'use client'

interface BudgetCardProps {
  category: string
  limit: number
  used: number
  remaining: number
  percentage: number
  alertLevel: 'ok' | 'caution' | 'warning' | 'over'
  onDelete?: () => void
}

export function BudgetCard({
  category,
  limit,
  used,
  remaining,
  percentage,
  alertLevel,
  onDelete
}: BudgetCardProps) {
  const getColor = () => {
    switch (alertLevel) {
      case 'ok':
        return 'bg-emerald-500'
      case 'caution':
        return 'bg-yellow-500'
      case 'warning':
        return 'bg-orange-500'
      case 'over':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    if (remaining < 0) {
      return `Ultrapassado por R$ ${Math.abs(remaining).toFixed(2)}`
    }
    return `R$ ${remaining.toFixed(2)} restante`
  }

  const getStatusColor = () => {
    if (remaining < 0) return 'text-red-400'
    if (percentage >= 80) return 'text-orange-400'
    if (percentage >= 50) return 'text-yellow-400'
    return 'text-emerald-400'
  }

  return (
    <div className="bg-[#101012] border border-zinc-800 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-white">{category}</h3>
          <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>R$ {used.toFixed(2)}</span>
          <span>R$ {limit.toFixed(2)}</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-zinc-500">
        {percentage.toFixed(0)}% utilizado
      </div>
    </div>
  )
}
