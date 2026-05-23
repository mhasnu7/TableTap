'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as CustomUser } from '@/types/user'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

interface AuthContextType {
  user: CustomUser | null
  loading: boolean
  login: (phone: string, pin: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  login: async () => false, 
  logout: () => {} 
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('tabletap_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (phone: string, pin: string): Promise<boolean> => {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('phone', '==', phone), where('pin', '==', pin))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]
      const userData = { id: userDoc.id, ...userDoc.data() } as CustomUser
      setUser(userData)
      localStorage.setItem('tabletap_user', JSON.stringify(userData))
      // Set cookie for middleware (expires in 1 day)
      document.cookie = `__session_role=${userData.role}; path=/; max-age=86400; SameSite=Strict`
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('tabletap_user')
    // Clear cookie
    document.cookie = '__session_role=; path=/; max-age=0'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
