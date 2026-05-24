import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types/user';

export const addStaff = async (restaurantId: string, staffData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'restaurantId'>) => {
  return await addDoc(collection(db, `restaurants/${restaurantId}/staff`), {
    ...staffData,
    restaurantId,
    createdAt: serverTimestamp(),
    active: true,
  });
};

export const getStaff = async (restaurantId: string) => {
  const q = collection(db, `restaurants/${restaurantId}/staff`);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
};

export const subscribeToStaff = (restaurantId: string, callback: (staff: User[]) => void) => {
  const q = collection(db, `restaurants/${restaurantId}/staff`);
  return onSnapshot(q, (snapshot) => {
    const staff = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
    callback(staff);
  });
};

export const updateStaffStatus = async (restaurantId: string, staffId: string, active: boolean) => {
  const staffRef = doc(db, `restaurants/${restaurantId}/staff`, staffId);
  await updateDoc(staffRef, { active });
};

export const updateStaffRole = async (restaurantId: string, staffId: string, role: string) => {
  const staffRef = doc(db, `restaurants/${restaurantId}/staff`, staffId);
  await updateDoc(staffRef, { role });
};
