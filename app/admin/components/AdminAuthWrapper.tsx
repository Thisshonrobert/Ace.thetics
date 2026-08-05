'use client'

import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export default function AdminAuthWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  // `status === 'loading'` already covers the pre-hydration case, so the extra
  // `mounted` state the old version used (which rendered `null` on the very
  // first paint) just added a blank flash.
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Checking access…
      </div>
    )
  }

  if (session?.user?.email !== adminEmail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-50">
          <ShieldAlert className="h-7 w-7 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Admins only</h1>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          {session
            ? `You're signed in as ${session.user?.email}, which doesn't have admin access.`
            : 'Sign in with the admin account to manage site content.'}
        </p>
        <div className="mt-6 flex gap-2">
          {session ? (
            <Button variant="outline" onClick={() => signOut({ callbackUrl: '/admin' })}>
              Switch account
            </Button>
          ) : (
            <Button onClick={() => signIn(undefined, { callbackUrl: '/admin' })}>Sign in</Button>
          )}
          <Button asChild variant="ghost">
            <Link href="/">Back to site</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="flex items-center justify-end gap-3 bg-gray-900 px-4 py-1.5 text-xs text-gray-300"
        suppressHydrationWarning
      >
        <span>Signed in as {session?.user?.email}</span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="underline underline-offset-2 hover:text-white"
        >
          Sign out
        </button>
      </div>
      {children}
    </>
  )
}
