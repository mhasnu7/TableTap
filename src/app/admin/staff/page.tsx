
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToStaff } from '@/services/staffService';
import { User } from '@/types/user';
import AddStaffModal from '@/components/admin/AddStaffModal';
import StaffList from '@/components/admin/StaffList';
import { PlusCircle } from 'lucide-react';

export default function AdminStaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.restaurantId) {
      const unsubscribe = subscribeToStaff(user.restaurantId, (fetchedStaff) => {
        setStaff(fetchedStaff);
      });
      return () => unsubscribe();
    }
  }, [user?.restaurantId]);

  if (!user || user.role !== 'admin') {
    return <p>Access Denied</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="mr-2" size={20} /> Add Staff
        </button>
      </div>
      <StaffList staff={staff} restaurantId={user.restaurantId} />
      {user.restaurantId && (
        <AddStaffModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          restaurantId={user.restaurantId}
        />
      )}
    </div>
  );
}
