import { supabase } from '@/lib/supabase'
import { User } from '@/types'

export async function signInWithPhone(phone: string) {
  // Simple phone lookup - no OTP
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single()

  if (error || !data) {
    throw new Error('Nomor telepon tidak terdaftar')
  }

  return data
}

export async function signUp(
  phone: string,
  name: string,
  email?: string,
  address?: string
) {
  // Check if phone already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('phone', phone)
    .single()

  if (existing) {
    throw new Error('Nomor telepon sudah terdaftar')
  }

  // Create user profile
  const { data, error } = await supabase
    .from('users')
    .insert({
      name,
      phone,
      email,
      address,
      role: 'customer',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function signOut() {
  // Clear local storage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dapurpos_user')
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem('dapurpos_user')
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) return false
  return data?.role === 'admin'
}

// Admin login with username/password
export async function adminLogin(username: string, password: string): Promise<User | null> {
  // For demo: admin/admin123
  if (username === 'admin' && password === 'admin123') {
    // Try to get from database
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .limit(1)
      .single()

    // If found in DB, use it
    if (data && !error) {
      localStorage.setItem('dapurpos_user', JSON.stringify(data))
      return data
    }

    // Fallback: create admin user object if not in DB
    const adminUser: User = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Admin',
      phone: '0812-0000-0000',
      email: 'admin@dapurpos.com',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    localStorage.setItem('dapurpos_user', JSON.stringify(adminUser))
    return adminUser
  }
  throw new Error('Username atau password salah')
}
