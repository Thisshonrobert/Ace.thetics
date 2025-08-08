'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export default function AdminAuthWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch
  if (!mounted) return null

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const isAdmin = session?.user?.email === adminEmail

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Access denied. Admins only.</p>
      </div>
    )
  }

  return (
    <>
      <div
        className="bg-gray-800 text-white py-2 px-4 text-sm text-right"
        suppressHydrationWarning
      >
        Logged in as: {session?.user?.email}
      </div>
      {children}
    </>
  )
}
