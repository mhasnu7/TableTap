'use client'
import { Table } from '@/types/table'

interface TableGridProps {
  tables: Table[]
  onSelectTable: (table: Table) => void
}

const statusColors: Record<string, string> = {
  available: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-400/60 hover:bg-emerald-500/20',
  occupied: 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:border-amber-400/60 hover:bg-amber-500/20',
  billing: 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:border-blue-400/60 hover:bg-blue-500/20',
  cleaning: 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:border-rose-400/60 hover:bg-rose-500/20',
}

export default function TableGrid({ tables, onSelectTable }: TableGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {tables.map((table) => (
        <button
          key={table.id}
          onClick={() => onSelectTable(table)}
          className={`p-5 rounded-2xl border shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.03] text-left flex flex-col justify-between h-28 ${statusColors[table.status] || 'bg-gray-900/60 border-gray-800 text-gray-400'}`}
        >
          <h3 className="font-bold text-lg tracking-tight">{table.name}</h3>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90">{table.status}</p>
        </button>
      ))}
    </div>
  )
}
