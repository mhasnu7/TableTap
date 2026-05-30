'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { STAFF_ROLES } from '@/lib/staffConfig';

export default function StaffAccessPage() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { staffLogin } = useAuth();

  const handleAccess = async () => {
    const user = await staffLogin(phone, pin);
    if (user) {
      if (user.role === STAFF_ROLES.WAITER) {
        router.push('/staff/waiter');
      } else {
        router.push('/staff/kitchen');
      }
    } else {
      setError('Invalid Access Credentials');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Restaurant Staff Access</h1>
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 mb-4"
        placeholder="Enter Phone Number"
      />
      <input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="border p-2 mb-4"
        placeholder="Enter Access PIN"
      />
      <button onClick={handleAccess} className="bg-blue-500 text-white p-2 rounded">
        Access Dashboard
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
