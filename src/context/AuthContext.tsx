'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as CustomUser } from '@/types/user'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, query, where, getDocs, updateDoc, serverTimestamp, setDoc, collectionGroup } from 'firebase/firestore'
import { normalizePhoneNumber } from '@/lib/formatters'

interface AuthContextType {
  user: CustomUser | null
  loading: boolean
  login: (phone: string, pin: string) => Promise<boolean>
  staffLogin: (phone: string, pin: string) => Promise<CustomUser | null>
  signup: (name: string, email: string, phone: string, pin: string) => Promise<boolean>
  logout: () => void
  setUser: (user: CustomUser | null) => void
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  login: async () => false,
  staffLogin: async () => null,
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
      
      // Staff must use the staff login page
      if (['waiter', 'kitchen', 'cashier'].includes(userData.role)) return false;

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

  const staffLogin = async (phone: string, pin: string): Promise<CustomUser | null> => {
    console.log('Authenticating staff...');
    console.log('Phone entered:', phone.trim());

    const staffRef = collectionGroup(db, "staff");
    
    // Query conditions
    const q = query(
      staffRef,
      where("phone", "==", phone.trim()),
      where("pin", "==", pin.trim()),
      where("active", "==", true)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Firestore query result count:', querySnapshot.size);
    
    if (querySnapshot.empty) {
      console.log('No matching staff found');
      return null;
    }

    const staffDoc = querySnapshot.docs[0];
    const staffData = { id: staffDoc.id, ...staffDoc.data() } as CustomUser;
    console.log('Role found:', staffData.role);
    
    // Update lastLogin
    await updateDoc(staffDoc.ref, { lastLogin: serverTimestamp() });
    const updatedStaffData = { ...staffData, lastLogin: new Date() };

    setUser(updatedStaffData)
    localStorage.setItem('tabletap_user', JSON.stringify(updatedStaffData))
    // Set cookie for middleware (expires in 1 day)
    document.cookie = `__session_role=${updatedStaffData.role}; path=/; max-age=86400; SameSite=Strict`
    document.cookie = `__session_restaurantId=${updatedStaffData.restaurantId || ''}; path=/; max-age=86400; SameSite=Strict`
    
    const redirectDestination = updatedStaffData.role === 'waiter' ? '/staff/waiter' : '/staff/kitchen';
    console.log('Redirect destination:', redirectDestination);
    
    return updatedStaffData;
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('tabletap_user')
    // Clear cookie
    document.cookie = '__session_role=; path=/; max-age=0'
    document.cookie = '__session_restaurantId=; path=/; max-age=0'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, staffLogin, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
