'use client'

interface ChartDataPoint {
  label: string
  value: number
}

export function LineChart({ data, title }: { data: ChartDataPoint[]; title: string }) {
  if (data.length === 0) return <p className="text-gray-400">Sem dados</p>

  const maxValue = Math.max(...data.map(d => d.value))
  const height = 200
  const width = 600

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full border border-gray-700 rounded">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={`grid-${i}`}
            x1="40"
            y1={40 + (i * 160) / 4}
            x2={width - 20}
            y2={40 + (i * 160) / 4}
            stroke="#374151"
            strokeWidth="0.5"
          />
        ))}

        {/* Line path */}
        {data.length > 1 && (
          <polyline
            points={data
              .map((d, i) => {
                const x = 40 + (i * (width - 60)) / (data.length - 1)
                const y = 160 - (d.value / maxValue) * 160 + 40
                return `${x},${y}`
              })
              .join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />
        )}

        {/* Points */}
        {data.map((d, i) => (
          <circle
            key={`point-${i}`}
            cx={40 + (i * (width - 60)) / (data.length - 1)}
            cy={160 - (d.value / maxValue) * 160 + 40}
            r="4"
            fill="#10b981"
          />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={`label-${i}`}
            x={40 + (i * (width - 60)) / (data.length - 1)}
            y={height - 5}
            textAnchor="middle"
            className="text-xs fill-gray-400"
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

export function DonutChart({ data, title }: { data: ChartDataPoint[]; title: string }) {
  if (data.length === 0) return <p className="text-gray-400">Sem dados</p>

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

  let currentAngle = 0
  const slices = data.map((d, i) => {
    const sliceAngle = (d.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + sliceAngle
    currentAngle = endAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = 100 + 70 * Math.cos(startRad)
    const y1 = 100 + 70 * Math.sin(startRad)
    const x2 = 100 + 70 * Math.cos(endRad)
    const y2 = 100 + 70 * Math.sin(endRad)

    const largeArc = sliceAngle > 180 ? 1 : 0
    const path = `M 100 100 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z`

    return { path, color: colors[i % colors.length], ...d }
  })

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <div className="flex gap-8">
        <svg width="200" height="200" viewBox="0 0 200 200" className="flex-shrink-0">
          {slices.map((slice, i) => (
            <path key={`slice-${i}`} d={slice.path} fill={slice.color} />
          ))}
          <circle cx="100" cy="100" r="40" fill="#09090b" />
        </svg>

        <div className="flex flex-col gap-2 justify-center">
          {slices.map((slice, i) => (
            <div key={`legend-${i}`} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="text-gray-300">{slice.label}</span>
              <span className="text-gray-500 ml-auto">
                {((slice.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
