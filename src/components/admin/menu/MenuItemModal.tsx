'use client'

import { useState, useEffect } from 'react'
import { MenuItem } from '@/types/menu'
import { useAuth } from '@/context/AuthContext'
import { addMenuItem, updateMenuItem } from '@/services/menuService'
import { useToast } from '@/context/ToastContext'
import ImageUpload from '@/components/ImageUpload'

interface MenuItemModalProps {
  isOpen: boolean
  onClose: () => void
  item?: MenuItem | null
}

export function MenuItemModal({ isOpen, onClose, item }: MenuItemModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'Main Course',
    image: '',
    available: true,
    featured: false,
    spicyLevel: 'none',
    veg: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) setFormData(item)
    else setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'Main Course',
        image: '',
        available: true,
        featured: false,
        spicyLevel: 'none',
        veg: true,
    })
  }, [item, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.restaurantId || !formData.name || !formData.price) return

    setSaving(true)
    console.log('Saving menu item')
    try {
        if (item) {
            await updateMenuItem(user.restaurantId, item.id, formData)
            showToast('Menu item updated')
        } else {
            await addMenuItem(user.restaurantId, formData as Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>)
            showToast('Menu item added')
        }
        console.log('Menu item saved successfully')
        onClose()
    } catch (error) {
        console.error(error)
        showToast('Error saving item')
    } finally {
        setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{item ? 'Edit' : 'Add'} Menu Item</h2>
            
            <ImageUpload 
                onUpload={(url) => setFormData({...formData, image: url})} 
                currentImage={formData.image}
                folder="menu-items"
            />
            
            <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border mb-2" required />
            <input type="text" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border mb-2" />
            <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full p-2 border mb-2" required />
            
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border mb-2">
                {['Starters', 'Main Course', 'Pizza', 'Burgers', 'Drinks', 'Desserts'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <label className="flex items-center gap-2 mb-2"><input type="checkbox" checked={formData.veg} onChange={e => setFormData({...formData, veg: e.target.checked})} /> Veg</label>
            <label className="flex items-center gap-2 mb-2"><input type="checkbox" checked={formData.available} onChange={e => setFormData({...formData, available: e.target.checked})} /> Available</label>
            
            <button type="submit" className="w-full bg-primary text-white p-2 rounded" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={onClose} className="w-full mt-2 p-2 text-gray-600">Cancel</button>
        </form>
    </div>
  )
}
