'use client'
import { useEffect, useState } from 'react'
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { tableService } from '@/services/tableService'
import { Table } from '@/types/table'
import { TableCard } from '@/components/admin/TableCard'

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState(2)
  const { user } = useAuth()
  const restaurantId = user?.restaurantId

  useEffect(() => {
    if (!restaurantId) return
    const q = query(collection(db, `restaurants/${restaurantId}/tables`), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTables(data as Table[])
    })
    return () => unsubscribe()
  }, [restaurantId])

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!restaurantId) return
    await tableService.addTable(restaurantId, { name, capacity, active: true, status: 'available' })
    setName('')
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900">QR Table Management</h2>
        <p className="text-slate-500 mt-2">Manage your tables and download QR codes.</p>
      </header>

      <form onSubmit={handleAddTable} className="mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-end">
        <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Table Name</label>
            <input 
                className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="e.g. VIP 1" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required
            />
        </div>
        <div className="w-32">
            <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
            <input 
                type="number" 
                className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="2" 
                value={capacity} 
                onChange={e => setCapacity(parseInt(e.target.value))} 
                required
            />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition" type="submit">Add Table</button>
      </form>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.map(table => (
          <TableCard key={table.id} table={table} restaurantId={restaurantId!} />
        ))}
      </div>
    </div>
  )
}
