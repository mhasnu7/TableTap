'use client'

import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user && user.role !== 'waiter') {
      router.push(`/${user.role}`)
    }
  }, [user, loading, router])

  if (loading || !user) return null

  return <DashboardLayout>{children}</DashboardLayout>
}