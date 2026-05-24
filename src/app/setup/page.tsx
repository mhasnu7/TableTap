'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SetupProvider, useSetup } from '@/context/SetupContext';
import { useAuth } from '@/context/AuthContext';
import { Step1, Step2, Step3, Step4, Step5 } from '@/components/setup/Steps';
import { onboardingService } from '@/services/onboardingService';
import { useToast } from '@/context/ToastContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

function Summary({ data }: { data: any }) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Summary</h2>
            <p>Restaurant: {data.name}</p>
            <p>Payment: {data.paymentMode}</p>
            <p>Tables: {data.tableCount}</p>
            <p>Owner: {data.admin?.name} ({data.admin?.phone})</p>
        </div>
    )
}

function SetupForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { data } = useSetup();
  const { user, setUser } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [progress, setProgress] = useState('');
  const [success, setSuccess] = useState<any>(null);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  
  const handleFinish = async () => {
    // Basic validation
    if (!data.name || !data.admin || !data.admin.name || !data.admin.phone) {
        showToast('Please fill all required fields');
        return;
    }

    // Duplicate name validation
    setLoading(true);
    setProgress('Checking restaurant name...');
    try {
        const q = query(collection(db, 'restaurants'), where('name', '==', data.name));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            showToast('Restaurant name already exists');
            setLoading(false);
            setProgress('');
            return;
        }
    } catch (error) {
        console.error('Validation failed:', error);
        showToast('Failed to validate restaurant name');
        setLoading(false);
        setProgress('');
        return;
    }

    setProgress('Starting setup...');
    
    // Timeout promise
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 60000)
    );

    try {
        const setupPromise = onboardingService.setupRestaurant(data, (msg) => setProgress(msg));
        const restaurantId = await Promise.race([setupPromise, timeoutPromise]);
        
        // Save restaurantId to user profile
        if (user) {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, { restaurantId: restaurantId });
            setUser({ ...user, restaurantId: restaurantId as string });
        }
        
        // Save restaurantId to localStorage
        localStorage.setItem('tabletap_restaurantId', restaurantId as string);
        // Also update the user in localStorage
        if (user) {
            localStorage.setItem('tabletap_user', JSON.stringify({ ...user, restaurantId: restaurantId as string }));
        }
        
        // Update cookie
        document.cookie = `__session_restaurantId=${restaurantId}; path=/; max-age=86400; SameSite=Strict`
        
        setSuccess({
            name: data.name,
            tableCount: data.tableCount,
            phone: data.admin.phone,
            restaurantId
        });
        showToast('Restaurant created successfully');
    } catch (error: any) {
        console.error('Restaurant setup failed:', error);
        if (error.message === 'TIMEOUT') {
            showToast('Setup is taking longer than expected.');
        } else {
            showToast(`Failed to setup restaurant: ${error.message}`);
        }
    } finally {
        setLoading(false);
        setProgress('');
    }
  }

  // Success Modal
  if (success) {
      return (
        <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4">Restaurant Created Successfully</h2>
            <div className="text-left bg-gray-50 p-4 rounded mb-6">
                <p><strong>Name:</strong> {success.name}</p>
                <p><strong>Restaurant ID:</strong> {success.restaurantId}</p>
                <p><strong>Tables Created:</strong> {success.tableCount}</p>
                <p><strong>Owner Phone:</strong> {success.phone}</p>
            </div>
            <div className="flex justify-center gap-4">
                <button onClick={() => router.push('/admin')} className="px-6 py-2 bg-blue-600 text-white rounded">Go to Dashboard</button>
            </div>
        </div>
      );
  }

  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-6">Setup Your Restaurant</h1>
      
      {loading && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded text-center">
              {progress}
          </div>
      )}

      <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  {s}
              </div>
          ))}
      </div>

      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
      {step === 5 && <Step5 />}
      {step === 6 && <Summary data={data} />}

      <div className="mt-8 flex justify-between">
          <button onClick={prevStep} disabled={step === 1 || loading} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Back</button>
          {step === 6 ? (
              <button onClick={handleFinish} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">{loading ? 'Creating...' : 'Finish Setup'}</button>
          ) : (
              <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
          )}
      </div>
    </div>
  );
}

export default function SetupPage() {
    return (
        <SetupProvider>
            <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
                <SetupForm />
            </div>
        </SetupProvider>
    )
}
