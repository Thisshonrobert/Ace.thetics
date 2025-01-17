'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminAuthWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    console.log("Session:", session); // Log session data
    console.log("Status:", status); // Log status

    if (!session || (session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL )) {
      window.alert("not a admin");
      router.push('/')
    }
  }, [session, status, router])

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <>
      {session?.user?.email && (
        <div className="bg-gray-800 text-white py-2 px-4 text-sm text-right">
          Logged in as: {session.user.email}
        </div>
      )}
      {children}
    </>
  )
} 