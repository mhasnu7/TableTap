'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as CustomUser } from '@/types/user'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, query, where, getDocs, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore'

interface AuthContextType {
  user: CustomUser | null
  loading: boolean
  login: (phone: string, pin: string) => Promise<boolean>
  signup: (name: string, email: string, phone: string, pin: string) => Promise<boolean>
  logout: () => void
  setUser: (user: CustomUser | null) => void
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  login: async () => false, 
  signup: async () => false,
  logout: () => {},
  setUser: () => {}
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

  const signup = async (name: string, email: string, phone: string, pin: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, 'users')
      // Check if user exists
      const q = query(usersRef, where('phone', '==', phone))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) return false // User exists

      // Using crypto.randomUUID() for a realistic uid
      const uid = crypto.randomUUID()
      const newUser: Omit<CustomUser, 'id'> = {
        name,
        email,
        phone,
        pin,
        role: 'owner', // Requirement: role "owner"
        restaurantId: '', // To be updated in onboarding
        active: true,
        createdAt: new Date(),
      }
      
      const userRef = doc(db, 'users', uid)
      await setDoc(userRef, { ...newUser, id: uid })
      
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  const login = async (phone: string, pin: string): Promise<boolean> => {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('phone', '==', phone), where('pin', '==', pin))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]
      const userData = { id: userDoc.id, ...userDoc.data() } as CustomUser
      
      if (!userData.active) return false;

      // Update lastLogin
      await updateDoc(userDoc.ref, { lastLogin: serverTimestamp() });
      const updatedUserData = { ...userData, lastLogin: new Date() };

      setUser(updatedUserData)
      localStorage.setItem('tabletap_user', JSON.stringify(updatedUserData))
      // Set cookie for middleware (expires in 1 day)
      document.cookie = `__session_role=${updatedUserData.role}; path=/; max-age=86400; SameSite=Strict`
      document.cookie = `__session_restaurantId=${updatedUserData.restaurantId || ''}; path=/; max-age=86400; SameSite=Strict`
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
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
