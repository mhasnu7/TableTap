'use client'

import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'

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

  const navItems = (
    <Link href="/staff" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg">
      <Users size={20} /> Staff Overview
    </Link>
  )

  return <DashboardLayout navItems={navItems} title="Staff Dashboard">{children}</DashboardLayout>
}
