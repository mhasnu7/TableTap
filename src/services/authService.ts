import { db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from '../types/user';

export const seedDemoUsers = async () => {
  const users = [
    {
      id: 'admin-user',
      name: 'Admin User',
      phone: '1111111111',
      pin: '1234',
      role: 'admin',
      restaurantId: 'rest-1',
      active: true,
      createdAt: new Date(),
    },
  ];

  for (const user of users) {
    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, user);
      console.log(`Created user: ${user.name}`);
    }
  }
};
