'use client'
import { useEffect, useState } from 'react'
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { tableService } from '@/services/tableService'
import { Table } from '@/types/table'

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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Table Management</h2>
      <form onSubmit={handleAddTable} className="mb-6 bg-white p-4 rounded shadow">
        <input 
            className="border p-2 mr-2" 
            placeholder="Table Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required
        />
        <input 
            type="number" 
            className="border p-2 mr-2" 
            placeholder="Capacity" 
            value={capacity} 
            onChange={e => setCapacity(parseInt(e.target.value))} 
            required
        />
        <button className="bg-blue-500 text-white p-2 rounded" type="submit">Add Table</button>
      </form>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tables.map(table => (
          <div key={table.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{table.name}</h3>
            <p>Capacity: {table.capacity}</p>
            <p>Status: {table.status}</p>
            <button 
                className="text-red-500 mt-2" 
                onClick={() => tableService.deleteTable(restaurantId!, table.id)}
            >
                Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
