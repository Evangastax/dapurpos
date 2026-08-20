'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UtensilsCrossed, Phone, Lock } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loginType, setLoginType] = useState<'customer' | 'admin'>('customer')
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCustomerLogin() {
    if (!phone) {
      setError('Nomor telepon harus diisi')
      return
    }
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .eq('role', 'customer')
        .single()

      if (error || !data) {
        setError('Nomor telepon tidak terdaftar. Silakan daftar terlebih dahulu.')
        return
      }

      login(data)
      router.push('/menu')
    } catch (err: any) {
      setError(err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdminLogin() {
    if (!username || !password) {
      setError('Username dan password harus diisi')
      return
    }
    setLoading(true)
    setError('')

    if (username === 'admin' && password === 'admin123') {
      const adminUser = {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Admin',
        phone: '0812-0000-0000',
        email: 'admin@dapurpos.com',
        role: 'admin' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      login(adminUser)
      router.push('/admin')
    } else {
      setError('Username atau password salah')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Masuk ke DapurPOS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Login Type Toggle */}
          <div className="flex rounded-lg bg-muted p-1">
            <button
              onClick={() => { setLoginType('customer'); setError('') }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                loginType === 'customer'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              <Phone className="inline-block mr-2 h-4 w-4" />
              Pelanggan
            </button>
            <button
              onClick={() => { setLoginType('admin'); setError('') }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                loginType === 'admin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              <Lock className="inline-block mr-2 h-4 w-4" />
              Admin
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Customer Login */}
          {loginType === 'customer' && (
            <>
              <Input
                label="Nomor WhatsApp"
                type="tel"
                placeholder="0812-3456-7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                helperText="Masukkan nomor yang terdaftar"
              />
              <Button className="w-full" onClick={handleCustomerLogin} loading={loading}>
                <Phone className="mr-2 h-4 w-4" />
                Masuk
              </Button>
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Belum punya akun? </span>
                <Link href="/register" className="text-primary hover:underline">
                  Daftar
                </Link>
              </div>
            </>
          )}

          {/* Admin Login */}
          {loginType === 'admin' && (
            <>
              <Input
                label="Username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button className="w-full" onClick={handleAdminLogin} loading={loading}>
                <Lock className="mr-2 h-4 w-4" />
                Masuk sebagai Admin
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
