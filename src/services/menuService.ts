import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { MenuItem } from '@/types/menu'

export async function getMenu(
  restaurantId: string
) {
  const menuRef = collection(
    db,
    'restaurants',
    restaurantId,
    'menu'
  )

  const snapshot = await getDocs(menuRef)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MenuItem[]
}

export function subscribeToMenu(
  restaurantId: string,
  callback: (menu: MenuItem[]) => void
) {
  const menuRef = collection(
    db,
    'restaurants',
    restaurantId,
    'menu'
  )
  
  return onSnapshot(query(menuRef), (snapshot) => {
    const menu = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[]
    callback(menu)
  })
}

export async function addMenuItem(
  restaurantId: string,
  item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>
) {
  const menuRef = collection(
    db,
    'restaurants',
    restaurantId,
    'menu'
  )

  return await addDoc(menuRef, {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateMenuItem(
  restaurantId: string,
  itemId: string,
  updates: Partial<MenuItem>
) {
  const itemRef = doc(
    db,
    'restaurants',
    restaurantId,
    'menu',
    itemId
  )

  return await updateDoc(itemRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteMenuItem(
  restaurantId: string,
  itemId: string
) {
  const itemRef = doc(
    db,
    'restaurants',
    restaurantId,
    'menu',
    itemId
  )

  return await deleteDoc(itemRef)
}
