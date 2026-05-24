'use client'

import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, UtensilsCrossed, QrCode, BookOpen, Settings } from 'lucide-react'
import { clsx } from 'clsx'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user && user.role !== 'admin') {
      router.push(`/${user.role}`)
    }
  }, [user, loading, router])

  if (loading || !user) return null

  const navItems = (
    <>
      {[
        { href: '/admin', label: 'Admin Overview', icon: LayoutDashboard },
        { href: '/admin/staff', label: 'Staff Management', icon: Users },
        { href: '/admin/tables', label: 'Table Management', icon: UtensilsCrossed },
        { href: '/admin/qr', label: 'QR Management', icon: QrCode },
        { href: '/admin/menu', label: 'Menu Management', icon: BookOpen },
        { href: '/admin/settings', label: 'Restaurant Settings', icon: Settings },
      ].map((item) => (
        <Link 
          key={item.href} 
          href={item.href} 
          className={clsx("flex items-center gap-3 px-4 py-3 rounded-lg", {
            "bg-indigo-50 dark:bg-gray-700 text-indigo-700 dark:text-indigo-300": pathname === item.href,
            "text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700": pathname !== item.href
          })}
        >
          <item.icon size={20} /> {item.label}
        </Link>
      ))}
    </>
  )

  return <DashboardLayout navItems={navItems} title="Admin Dashboard">{children}</DashboardLayout>
}
