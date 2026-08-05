'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { FilePlus2, PencilLine, Trash2, UserCog } from 'lucide-react'
import 'react-toastify/dist/ReactToastify.css'

import { cn } from '@/lib/utils'
import AdminAuthWrapper from './components/AdminAuthWrapper'

const ToastContainer = dynamic(
  () => import('react-toastify').then(m => m.ToastContainer),
  { ssr: false }
)

const NAV_ITEMS = [
  { href: '/admin', label: 'New post', icon: FilePlus2 },
  { href: '/admin/update-post', label: 'Update post', icon: PencilLine },
  { href: '/admin/update-celebrity', label: 'Update celebrity', icon: UserCog },
  { href: '/admin/delete-post', label: 'Delete post', icon: Trash2 },
  { href: '/admin/delete-celebrity', label: 'Delete celebrity', icon: Trash2 },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center gap-6">
              <Link href="/admin" className="whitespace-nowrap text-lg font-bold text-gray-900">
                Acethetics <span className="text-gray-400">Admin</span>
              </Link>

              {/* One nav that scrolls horizontally on small screens, instead of
                  the old duplicated desktop/mobile lists that had drifted out of
                  sync (the mobile one still pointed at /admin/dashboard, which
                  does not exist). */}
              <div className="scrollbar-hide -mx-2 flex flex-1 items-center gap-1 overflow-x-auto px-2">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const isActive =
                    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </Link>
                  )
                })}
              </div>

              <Link
                href="/"
                className="hidden whitespace-nowrap text-sm text-gray-500 hover:text-gray-900 sm:block"
              >
                View site ↗
              </Link>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</main>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </AdminAuthWrapper>
  )
}
