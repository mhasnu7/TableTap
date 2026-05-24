'use client'
import { useEffect, useState } from 'react'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Table } from '@/types/table'
import { getBaseUrl } from '@/lib/getBaseUrl'
import { Copy, Download, Settings, Smartphone, RefreshCw } from 'lucide-react'

export default function QRManagementPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [baseUrl, setBaseUrl] = useState('')
  const { user } = useAuth()
  const restaurantId = user?.restaurantId

  useEffect(() => {
    const savedUrl = localStorage.getItem('tabletap_base_url')
    if (savedUrl) {
      setBaseUrl(savedUrl)
    } else {
      // Initialize with LAN IP if nothing in localStorage
      setBaseUrl('http://192.168.31.93:3000')
    }
  }, [])

  useEffect(() => {
    if (!restaurantId) return
    const q = query(collection(db, `restaurants/${restaurantId}/tables`))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTables(data as Table[])
      setLoading(false)
    })
    return () => unsubscribe()
  }, [restaurantId])

  const updateBaseUrl = (url: string) => {
    setBaseUrl(url)
    if (url) localStorage.setItem('tabletap_base_url', url)
    else localStorage.removeItem('tabletap_base_url')
  }

  const detectLanIp = async () => {
    try {
      const response = await fetch('/api/network')
      const data = await response.json()
      if (data.ip) {
        const newUrl = `http://${data.ip}:3000`
        updateBaseUrl(newUrl)
      }
    } catch (error) {
      console.error('Failed to detect LAN IP', error)
      alert('Failed to automatically detect LAN IP. Please enter it manually.')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (loading) return <div className="p-8">Loading QR codes...</div>

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-slate-900">QR Code Management</h2>
      
      {/* Settings Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Settings size={20} /> Settings</h3>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={baseUrl}
            onChange={(e) => updateBaseUrl(e.target.value)}
            placeholder="e.g. http://192.168.1.5:3000"
            className="flex-1 border border-slate-300 p-2 rounded-lg"
          />
          <button 
            onClick={detectLanIp}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <RefreshCw size={16} /> Auto-detect
          </button>
          <button 
            onClick={() => updateBaseUrl('http://192.168.31.93:3000')}
            className="bg-slate-200 text-slate-700 py-2 px-4 rounded-lg"
          >
            Reset
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-2">Base URL used for QR generation. Changes are saved automatically.</p>
      </div>

      {tables.length === 0 && <p className="text-slate-500">No tables found. Add a table to generate QR codes.</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map(table => {
          const qrUrl = `${baseUrl}${table.qrUrl}`
          const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`
          
          return (
            <div key={table.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
              <h3 className="font-bold text-lg mb-2 text-slate-800">{table.name}</h3>
              <img 
                src={qrApiUrl} 
                alt={`QR for ${table.name}`}
                className="w-40 h-40 mb-4"
              />
              <p className="text-xs text-slate-500 mb-4 break-all font-mono">{qrUrl}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => copyToClipboard(qrUrl)}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-lg transition"
                >
                  <Copy size={16} /> Copy URL
                </button>
                <a 
                  href={qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition"
                >
                  <Smartphone size={16} /> Test QR
                </a>
                <a
                  href={qrApiUrl}
                  download={`QR_${table.name}.png`}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition"
                >
                  <Download size={16} /> Download
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
