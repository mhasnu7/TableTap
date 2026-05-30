import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types/user';

export const addStaff = async (restaurantId: string, staffData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'restaurantId'>) => {
  console.log('addStaff called with:', { restaurantId, staffData });

  if (!restaurantId) {
    console.error('Error adding staff: restaurantId is missing');
    throw new Error('Restaurant ID is missing');
  }

  const path = `restaurants/${restaurantId}/staff`;
  const payload = {
    ...staffData,
    restaurantId,
    createdAt: serverTimestamp(),
    active: true,
  };

  console.log('Attempting Firestore write:', { path, payload });

  try {
    const docRef = await addDoc(collection(db, path), payload);
    console.log('Staff added successfully, doc ID:', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Firestore write error in addStaff:', error);
    throw error;
  }
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

export const deleteStaff = async (restaurantId: string, staffId: string) => {
  const staffRef = doc(db, `restaurants/${restaurantId}/staff`, staffId);
  await deleteDoc(staffRef);
};
