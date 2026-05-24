import { db } from '@/lib/firebase';
import { doc, setDoc, collection, addDoc, getDoc } from 'firebase/firestore';

async function generateRestaurantId(name: string): Promise<string> {
    const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    let id = baseId;
    let counter = 1;
    
    while (true) {
        const docRef = doc(db, 'restaurants', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return id;
        }
        counter++;
        id = `${baseId}-${counter}`;
    }
}

export const onboardingService = {
  async setupRestaurant(
    data: any,
    onProgress: (message: string) => void
  ) {
    try {
      // 1. Upload Images (DISABLED)
      onProgress('Skipping image upload...');
      console.log('Skipping storage upload');
      // TODO: Restore storage uploads in the future
      let logoUrl = '';
      let bannerUrl = '';

      // 2. Generate ID and Create Restaurant
      onProgress('Creating restaurant...');
      const restaurantId = await generateRestaurantId(data.name);
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      
      await setDoc(restaurantRef, {
        name: data.name,
        description: data.description,
        cuisine: data.cuisine,
        logo: logoUrl,
        banner: bannerUrl,
        themeColor: data.themeColor,
        paymentMode: data.paymentMode,
        createdAt: new Date(),
        ownerId: 'placeholder-for-auth-user' // TODO: Replace with real user ID
      });

      // 3. Create Tables
      onProgress('Generating tables...');
      const tablesCollectionRef = collection(db, `restaurants/${restaurantId}/tables`);
      const tablePromises = [];
      for (let i = 0; i < data.tableCount; i++) {
        tablePromises.push(
          addDoc(tablesCollectionRef, {
            name: `Table ${i + 1}`,
            active: true,
            status: 'available',
            createdAt: new Date(),
            qrUrl: `/r/${restaurantId}/table-${i + 1}`
          })
        );
      }
      await Promise.all(tablePromises);

      // 4. Create/Update Admin
      onProgress('Creating admin account...');
      await addDoc(collection(db, 'users'), {
        name: data.admin.name,
        phone: data.admin.phone,
        pin: data.admin.pin,
        role: 'admin',
        restaurantId: restaurantId,
        active: true,
        createdAt: new Date()
      });

      onProgress('Finalizing setup...');
      console.log('Restaurant created successfully');
      return restaurantId;
    } catch (error) {
      console.error('Restaurant setup failed:', error);
      throw error;
    }
  }
};
