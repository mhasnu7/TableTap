'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { restaurantService } from '@/services/restaurantService'
import { Restaurant } from '@/types/restaurant'
import { useToast } from '@/context/ToastContext'
import { Settings, Save, Loader2 } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function RestaurantSettingsPage() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    async function loadSettings() {
      if (user?.restaurantId) {
        const data = await restaurantService.getRestaurant(user.restaurantId)
        
        // Add default payment settings if missing
        const restaurantData = {
          ...data,
          paymentSettings: data.paymentSettings || {
            allowPrepaid: true,
            allowPayAtCounter: true,
            upiId: "",
            paymentQr: "",
            paymentMode: "both"
          }
        }
        
        setRestaurant(restaurantData as Restaurant)
        setLoading(false)
      }
    }
    loadSettings()
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!restaurant) return
    setSaving(true)
    try {
      await restaurantService.updateRestaurant(restaurant.id, restaurant)
      showToast('Settings saved successfully!')
    } catch (error) {
      showToast('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Settings /> Restaurant Settings
      </h2>
      <form onSubmit={handleSave} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div>
          <label className="block text-sm font-medium mb-1">Restaurant Name</label>
          <input 
            type="text" 
            value={restaurant?.name || ''} 
            onChange={(e) => setRestaurant(prev => prev ? {...prev, name: e.target.value} : null)}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            value={restaurant?.description || ''} 
            onChange={(e) => setRestaurant(prev => prev ? {...prev, description: e.target.value} : null)}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ImageUpload 
            currentImage={restaurant?.logo} 
            onUpload={(url) => setRestaurant(prev => prev ? {...prev, logo: url} : null)} 
            folder="logos"
          />
          <ImageUpload 
            currentImage={restaurant?.banner} 
            onUpload={(url) => setRestaurant(prev => prev ? {...prev, banner: url} : null)} 
            folder="banners"
          />
        </div>
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">UPI ID</label>
              <input
                type="text"
                value={restaurant?.paymentSettings?.upiId || ''}
                onChange={(e) => setRestaurant(prev => prev ? {...prev, paymentSettings: {...prev.paymentSettings, upiId: e.target.value}} : null)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="example@upi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment QR Code</label>
              <ImageUpload
                currentImage={restaurant?.paymentSettings?.paymentQr}
                onUpload={(url) => setRestaurant(prev => prev ? {...prev, paymentSettings: {...prev.paymentSettings, paymentQr: url}} : null)}
                folder="qrs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Mode</label>
              <select
                value={restaurant?.paymentSettings?.paymentMode || 'prepaid'}
                onChange={(e) => setRestaurant(prev => prev ? {...prev, paymentSettings: {...prev.paymentSettings, paymentMode: e.target.value as 'prepaid' | 'postpaid' | 'both'}} : null)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="prepaid">Prepaid Only</option>
                <option value="postpaid">Postpaid Only</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
          Save Changes
        </button>
      </form>
    </div>
  )
}
