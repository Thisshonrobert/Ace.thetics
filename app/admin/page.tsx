import { Metadata } from 'next'
import AdminPageClient from './AdminPageClient'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage your site content and settings',
  openGraph: {
    title: 'Admin Dashboard',
    description: 'Manage your site content and settings',
    type: 'website',
  },
}

export default async function AdminPage() {
  return <AdminPageClient />
}