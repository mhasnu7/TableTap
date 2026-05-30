'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function WaiterPage() {
    const router = useRouter()
    useEffect(() => {
        router.push('/staff/dashboard')
    }, [router])
    return null
}
