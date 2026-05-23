import {
  collection,
  getDocs,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'

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
  }))
}