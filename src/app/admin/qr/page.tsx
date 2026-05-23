'use client'
import { useEffect, useState } from 'react'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Table } from '@/types/table'

export default function QRManagementPage() {
  const [tables, setTables] = useState<Table[]>([])
  const { user } = useAuth()
  const restaurantId = user?.restaurantId

  useEffect(() => {
    if (!restaurantId) return
    const q = query(collection(db, `restaurants/${restaurantId}/tables`))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTables(data as Table[])
    })
    return () => unsubscribe()
  }, [restaurantId])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">QR Code Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.map(table => (
          <div key={table.id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 flex flex-col items-center">
            <h3 className="font-bold text-lg mb-2">{table.name}</h3>
            <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}${table.qrUrl}`} 
                alt={`QR for ${table.name}`}
                className="w-48 h-48 mb-4"
            />
            <a 
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${window.location.origin}${table.qrUrl}&download=1`}
                className="text-blue-500 font-semibold"
                download
            >
                Download PNG
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
