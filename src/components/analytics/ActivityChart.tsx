import { useState } from 'react'
import type { ActivityPoint } from '../../types/analytics'

interface ActivityChartProps {
  data: ActivityPoint[]
  isLoading?: boolean
}

interface ChartBar extends ActivityPoint {
  x: number
  y: number
  width: number
  height: number
}

export function ActivityChart({ data, isLoading = false }: ActivityChartProps) {
  const [hoveredBar, setHoveredBar] = useState<ChartBar | null>(null)

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 animate-pulse">
        <div className="h-4 w-32 rounded bg-slate-800" />
        <div className="h-40 w-full rounded bg-slate-800" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between h-72">
        <div>
          <h3 className="font-semibold text-white">User Activity</h3>
          <p className="text-xs text-slate-500">Active users trend</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <svg className="h-10 w-10 text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium">No activity data available</p>
          <p className="text-xs text-slate-600 mt-1">There are no records for this specific workspace selection.</p>
        </div>
      </div>
    )
  }

  const values = data.map((d) => d.value)
  const maxValue = Math.max(...values, 100)

  const svgWidth = 500
  const svgHeight = 220
  const paddingLeft = 45
  const paddingRight = 15
  const paddingTop = 20
  const paddingBottom = 35

  const chartWidth = svgWidth - paddingLeft - paddingRight
  const chartHeight = svgHeight - paddingTop - paddingBottom

  const barCount = data.length
  const barSpacing = 0.35
  const totalBarWidth = chartWidth / barCount
  const barWidth = totalBarWidth * (1 - barSpacing)
  const barMargin = totalBarWidth * barSpacing

  const bars = data.map((item, index) => {
    const x = paddingLeft + index * totalBarWidth + barMargin / 2
    const currentHeight = (item.value / maxValue) * chartHeight
    const y = svgHeight - paddingBottom - currentHeight
    return {
      ...item,
      x,
      y,
      width: barWidth,
      height: Math.max(currentHeight, 4),
    }
  })

  // Y-axis ticks
  const ticks = [0, 0.5, 1].map((ratio) => {
    const value = Math.round(maxValue * ratio)
    const y = svgHeight - paddingBottom - ratio * chartHeight
    return { y, value }
  })

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">User Activity</h3>
          <p className="text-xs text-slate-500">Active users trend</p>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] w-full relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full select-none overflow-visible"
        >
          <defs>
            <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {ticks.map((tick, idx) => (
            <g key={idx} className="opacity-40">
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={svgWidth - paddingRight}
                y2={tick.y}
                stroke="#334155"
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 10}
                y={tick.y + 3}
                textAnchor="end"
                className="text-[10px] font-medium fill-slate-500 font-mono"
              >
                {tick.value.toLocaleString()}
              </text>
            </g>
          ))}

          {bars.map((bar, idx) => {
            const isHovered = hoveredBar?.label === bar.label
            return (
              <g key={idx}>
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  rx={Math.min(bar.width / 4, 6)}
                  ry={Math.min(bar.width / 4, 6)}
                  fill="url(#bar-grad)"
                  className={`transition-all duration-150 cursor-pointer ${isHovered ? 'brightness-125' : 'hover:brightness-110'
                    }`}
                  onMouseEnter={() => setHoveredBar(bar)}
                  onMouseLeave={() => setHoveredBar(null)}
                />
              </g>
            )
          })}

          {bars.map((bar, idx) => (
            <text
              key={idx}
              x={bar.x + bar.width / 2}
              y={svgHeight - paddingBottom + 18}
              textAnchor="middle"
              className="text-[10px] font-semibold fill-slate-500 uppercase tracking-wider"
            >
              {bar.label}
            </text>
          ))}
        </svg>

        {hoveredBar && (
          <div
            className="absolute z-20 pointer-events-none rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-md transition-all duration-150"
            style={{
              left: `${((hoveredBar.x as number + (hoveredBar.width as number) / 2) / svgWidth) * 100}%`,
              top: `${((hoveredBar.y as number) / svgHeight) * 100 - 20}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <p className="text-slate-400 font-medium">{hoveredBar.label}</p>
            <p className="text-pink-400 text-sm font-bold mt-0.5">
              {hoveredBar.value.toLocaleString()} users
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
