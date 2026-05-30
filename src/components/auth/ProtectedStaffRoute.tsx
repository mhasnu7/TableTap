'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Props {
  role: string;
  children: React.ReactNode;
}

export default function ProtectedStaffRoute({ role, children }: Props) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    // Use AuthContext user or fallback to localStorage
    const storedUser = user || JSON.parse(localStorage.getItem('tabletap_user') || 'null');
    const currentRole = storedUser?.role;

    console.log("Authenticated user:", storedUser);
    console.log("Detected role:", currentRole);
    
    if (currentRole === role) {
      console.log("Protected route access granted");
      setIsAuthorized(true);
    } else {
      console.log("Redirecting because: currentRole (" + currentRole + ") does not match expected role (" + role + ")");
      router.push('/staff-access');
    }
    setIsLoading(false);
  }, [role, router, user, authLoading]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return <>{children}</>;
}
