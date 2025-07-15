'use client'

import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function LoadingDebug() {
  const { user, loading } = useAuth()

  if (typeof window === 'undefined') {
    return <div>SSR Mode</div>
  }

  return (
    <div className="fixed top-0 left-0 bg-black text-white p-4 z-50 text-xs">
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? 'logged in' : 'null'}</div>
      <div>Supabase: {supabase ? 'configured' : 'demo mode'}</div>
      <div>User Email: {user?.email || 'none'}</div>
      <div>User Role: {user?.user_metadata?.role || 'none'}</div>
      <div>Environment: {process.env.NODE_ENV}</div>
    </div>
  )
}