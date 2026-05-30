import { Table } from '@/types/table'
import { useState, useEffect } from 'react';
import { sessionService } from '@/services/sessionService';
import { Session } from '@/types/session';

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-400/60 hover:bg-emerald-500/20',
  OCCUPIED: 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:border-amber-400/60 hover:bg-amber-500/20',
  BILL_REQUESTED: 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:border-blue-400/60 hover:bg-blue-500/20',
  CLEANING: 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:border-rose-400/60 hover:bg-rose-500/20',
}

const TableItem = ({ table, onSelectTable }: { table: Table, onSelectTable: (table: Table) => void }) => {
    const [activeSession, setActiveSession] = useState<Session | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            if (table.status === 'OCCUPIED') {
                const session = await sessionService.getActiveSession(table.restaurantId, table.id)
                setActiveSession(session)
            } else {
                setActiveSession(null)
            }
        }
        fetchSession()
    }, [table.restaurantId, table.id, table.status])

    return (
        <button
          onClick={() => onSelectTable(table)}
          className={`p-5 rounded-2xl border shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.03] text-left flex flex-col justify-between h-40 ${statusColors[table.status] || 'bg-gray-900/60 border-gray-800 text-gray-400'}`}
        >
          <h3 className="font-bold text-lg tracking-tight">{table.name}</h3>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90">{table.status}</p>
        </button>
    )
}

export default function TableGrid({ tables, onSelectTable }: { tables: Table[], onSelectTable: (table: Table) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {tables.map((table) => (
        <TableItem key={table.id} table={table} onSelectTable={onSelectTable} />
      ))}
    </div>
  )
}
