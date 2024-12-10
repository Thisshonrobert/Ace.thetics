import { Metadata } from 'next'
import { redirect } from 'next/navigation'

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
  redirect('/admin/dashboard')
}