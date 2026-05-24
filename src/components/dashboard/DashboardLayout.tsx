'use client'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { LayoutDashboard, Users, UtensilsCrossed, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

export default function DashboardLayout({ children, navItems, title }: { children: React.ReactNode, navItems: React.ReactNode, title: string }) {
  const { logout, user, loading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className={clsx("fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out", {
        "-translate-x-full lg:translate-x-0": !isSidebarOpen,
        "translate-x-0": isSidebarOpen
      })}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">TableTap</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500">
            <Menu />
          </button>
        </div>
        <nav className="mt-6 flex-1 px-4 space-y-2">
          {navItems}
        </nav>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={logout} className="flex items-center gap-3 text-red-600 dark:text-red-400 font-semibold hover:text-red-800">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className={clsx("flex-1 transition-all duration-300", {
        "lg:ml-64": isSidebarOpen,
        "ml-0": !isSidebarOpen
      })}>
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 dark:text-gray-400 mr-4">
            <Menu />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white capitalize">{title}</h2>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
