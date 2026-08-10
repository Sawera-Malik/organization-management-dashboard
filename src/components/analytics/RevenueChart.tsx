import { useState } from 'react'
import type { TrendPoint } from '../../types/analytics'

interface RevenueChartProps {
  data: TrendPoint[]
  isLoading?: boolean
}

export function RevenueChart({ data, isLoading = false }: RevenueChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number
    y: number
    label: string
    value: number
  } | null>(null)

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-slate-800" />
            <div className="h-3 w-48 rounded bg-slate-800" />
          </div>
          <div className="h-6 w-20 rounded bg-slate-800" />
        </div>
        <div className="h-48 w-full rounded bg-slate-800" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between h-72">
        <div>
          <h3 className="font-semibold text-white">Revenue Overview</h3>
          <p className="text-xs text-slate-500">Monthly recurring revenue trend</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <svg className="h-10 w-10 text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium">No revenue data available</p>
          <p className="text-xs text-slate-600 mt-1">There is no analytics information recorded for this period.</p>
        </div>
      </div>
    )
  }

  const values = data.map((d) => d.value)
  const maxValue = Math.max(...values, 100)
  const minValue = 0 

  const svgWidth = 600
  const svgHeight = 220
  const paddingLeft = 60
  const paddingRight = 30
  const paddingTop = 20
  const paddingBottom = 30

  const chartWidth = svgWidth - paddingLeft - paddingRight
  const chartHeight = svgHeight - paddingTop - paddingBottom

  const xScale = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth
  const yScale = maxValue > minValue ? chartHeight / (maxValue - minValue) : chartHeight

  const points = data.map((d, index) => {
    const x = paddingLeft + index * xScale
    const y = svgHeight - paddingBottom - (d.value - minValue) * yScale
    return { x, y, label: d.date, value: d.value }
  })

  const lineD = points.reduce((path, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`
  }, '')

  const areaD = points.length > 0
    ? `${lineD} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`
    : ''

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`
    return `$${val}`
  }

  const gridLines = [0, 0.33, 0.66, 1].map((ratio) => {
    const value = minValue + (maxValue - minValue) * ratio
    const y = svgHeight - paddingBottom - ratio * chartHeight
    return { y, value }
  })

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">Revenue Overview</h3>
          <p className="text-xs text-slate-500">Monthly recurring revenue trend</p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
          Live Sync
        </span>
      </div>

      <div className="flex-1 min-h-[220px] w-full relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full select-none overflow-visible"
        >
          <defs>
            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {gridLines.map((line, idx) => (
            <g key={idx} className="opacity-40">
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={svgWidth - paddingRight}
                y2={line.y}
                stroke="#334155"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <text
                x={paddingLeft - 10}
                y={line.y + 4}
                textAnchor="end"
                className="text-[10px] font-medium fill-slate-500 font-mono"
              >
                {formatCurrency(line.value)}
              </text>
            </g>
          ))}

          <path d={areaD} fill="url(#area-grad)" />

          <path
            d={lineD}
            fill="none"
            stroke="url(#line-grad)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.label === pt.label ? 6 : 4}
              className={`transition-all duration-150 cursor-pointer ${
                hoveredPoint?.label === pt.label
                  ? 'fill-indigo-400 stroke-slate-900 stroke-2'
                  : 'fill-indigo-600 stroke-slate-950 stroke-1 hover:fill-indigo-400'
              }`}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {points.map((pt, idx) => (
            <text
              key={idx}
              x={pt.x}
              y={svgHeight - paddingBottom + 18}
              textAnchor="middle"
              className="text-[10px] font-semibold fill-slate-500 uppercase tracking-wider"
            >
              {pt.label}
            </text>
          ))}
        </svg>

        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-md transition-all duration-150"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `${(hoveredPoint.y / svgHeight) * 100 - 25}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <p className="text-slate-400 font-medium">{hoveredPoint.label}</p>
            <p className="text-indigo-400 text-sm font-bold mt-0.5">
              {hoveredPoint.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
