'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { subscribeToMenu, deleteMenuItem, updateMenuItem } from '@/services/menuService'
import { MenuItem } from '@/types/menu'
import { Plus, Search, Trash2, Edit2 } from 'lucide-react'
import { MenuItemModal } from '@/components/admin/menu/MenuItemModal'

export default function MenuManagementPage() {
  const { user } = useAuth()
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  useEffect(() => {
    if (user?.restaurantId) {
      const unsubscribe = subscribeToMenu(user.restaurantId, (data) => {
        setMenu(data)
        setLoading(false)
      })
      return () => unsubscribe()
    }
  }, [user?.restaurantId])

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
        if (user?.restaurantId) {
            await deleteMenuItem(user.restaurantId, itemId)
        }
    }
  }

  const handleEdit = (item: MenuItem) => {
    console.log('Opening Edit Item modal')
    setSelectedItem(item)
    setModalOpen(true)
  }

  const handleAdd = () => {
    console.log('Opening Add Item modal')
    setSelectedItem(null)
    setModalOpen(true)
  }

  const handleToggleAvailability = async (item: MenuItem) => {
      if (user?.restaurantId) {
          await updateMenuItem(user.restaurantId, item.id, { available: !item.available })
      }
  }

  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div>Loading menu...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <button onClick={handleAdd} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={20} /> Add Item
        </button>
      </div>

      <div className="mb-4">
        <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full p-3 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredMenu.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No menu items yet</div>
      ) : (
        <div className="grid gap-4">
            {filteredMenu.map(item => (
                <div key={item.id} className="border p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <p className="font-bold">₹{item.price}</p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => handleToggleAvailability(item)} className={`px-3 py-1 rounded text-sm ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.available ? 'Available' : 'Unavailable'}
                        </button>
                        <button onClick={() => handleEdit(item)} className="text-blue-600"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600"><Trash2 size={18} /></button>
                    </div>
                </div>
            ))}
        </div>
      )}
      <MenuItemModal isOpen={modalOpen} onClose={() => setModalOpen(false)} item={selectedItem} />
    </div>
  )
}
