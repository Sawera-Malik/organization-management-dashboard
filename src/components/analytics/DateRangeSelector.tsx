import { useState, useRef, useEffect } from 'react'

export type DateRangeValue = '7d' | '30d' | '90d' | 'this_year'

interface DateRangeOption {
  value: DateRangeValue
  label: string
}

const OPTIONS: DateRangeOption[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'this_year', label: 'This year' },
]

interface DateRangeSelectorProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  disabled?: boolean
}

export function DateRangeSelector({ value, onChange, disabled }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = OPTIONS.find((opt) => opt.value === value) ?? OPTIONS[1]

  const handleSelect = (val: DateRangeValue) => {
    if (disabled) return
    onChange(val)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="date-range-selector-btn"
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
      >
        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{selectedOption.label}</span>
        <svg className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-1 duration-100">
          <div className="space-y-0.5" role="menu">
            {OPTIONS.map((opt) => {
              const isActive = opt.value === value
              return (
                <button
                  key={opt.value}
                  id={`date-range-option-${opt.value}`}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  role="menuitem"
                >
                  {opt.label}
                  {isActive && (
                    <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
