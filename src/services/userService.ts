import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types/user';

const USERS_COLLECTION = 'users';

export const addStaff = async (staffData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
  return await addDoc(collection(db, USERS_COLLECTION), {
    ...staffData,
    createdAt: serverTimestamp(),
    active: true,
  });
};

export const getStaff = async (restaurantId: string) => {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('restaurantId', '==', restaurantId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
};

export const subscribeToStaff = (restaurantId: string, callback: (staff: User[]) => void) => {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('restaurantId', '==', restaurantId)
  );
  return onSnapshot(q, (snapshot) => {
    const staff = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
    callback(staff);
  });
};

export const updateStaffStatus = async (staffId: string, active: boolean) => {
  const staffRef = doc(db, USERS_COLLECTION, staffId);
  await updateDoc(staffRef, { active });
};

export const deleteStaff = async (staffId: string) => {
  const staffRef = doc(db, USERS_COLLECTION, staffId);
  await deleteDoc(staffRef);
};

export const checkPhoneExists = async (phone: string, restaurantId: string): Promise<boolean> => {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('restaurantId', '==', restaurantId),
    where('phone', '==', phone)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};
