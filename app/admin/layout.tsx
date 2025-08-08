'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'

const ToastContainer = dynamic(
  () => import('react-toastify').then(m => m.ToastContainer),
  { ssr: false }
)

import AdminAuthWrapper from './components/AdminAuthWrapper'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-100 mt-10">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/admin/" className="text-xl font-bold text-gray-800">
                    Admin Dashboard
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/admin"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/update-post"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Update Post
                  </Link>
                  <Link
                    href="/admin/update-celebrity"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Update Celebrity
                  </Link>
                  <Link
                    href="/admin/delete-post"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Delete Post
                  </Link>
                  {/* <Link
                    href="/admin/delete-product"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Delete Product
                  </Link> */}
                  <Link
                    href="/admin/delete-celebrity"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Delete Celebrity
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                href="/admin/dashboard"
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/update-post"
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Update Post
              </Link>
              <Link
                href="/admin/update-celebrity"
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Update Celebrity
              </Link>
              <Link
                href="/admin/delete-post"
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Delete Post
              </Link>
              {/* <Link
                href="/admin/delete-product"
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Delete Product
              </Link> */}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </AdminAuthWrapper>
  )
} 