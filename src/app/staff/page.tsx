'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { normalizePhoneNumber } from '@/lib/formatters'

export default function StaffLogin() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { staffLogin } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const success = await staffLogin(normalizePhoneNumber(phone), pin)
    if (success) {
      const userStr = localStorage.getItem('tabletap_user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.role === 'waiter') router.push('/staff/waiter')
        else if (user.role === 'kitchen') router.push('/staff/kitchen')
        else if (user.role === 'admin') router.push('/admin')
        else router.push('/staff/dashboard')
      } else {
        router.push('/staff/dashboard')
      }
    } else {
      setError('Invalid phone number or PIN')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-2xl border border-gray-800 w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-white text-center">Staff Login</h1>
        <input 
          type="text" 
          placeholder="Phone Number" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
          required
        />
        <input 
          type="password" 
          placeholder="4-digit PIN" 
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          maxLength={4}
          className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
          required
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">Login</button>
      </form>
    </div>
  )
}
