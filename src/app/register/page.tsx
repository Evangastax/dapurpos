'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UtensilsCrossed, UserPlus, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleRegister() {
    if (!formData.name || !formData.phone) {
      setError('Nama dan nomor telepon harus diisi')
      return
    }
    setLoading(true)
    setError('')

    try {
      // Check if phone exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('phone', formData.phone)
        .single()

      if (existing) {
        setError('Nomor telepon sudah terdaftar')
        return
      }

      // Create user
      const { error } = await supabase
        .from('users')
        .insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          address: formData.address || null,
          role: 'customer',
        })

      if (error) throw error

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-muted-foreground mb-6">
              Akun Anda telah dibuat. Silakan masuk untuk mulai memesan.
            </p>
            <Button onClick={() => router.push('/login')}>
              Masuk Sekarang
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Daftar DapurPOS</CardTitle>
          <p className="text-muted-foreground">
            Buat akun untuk mulai memesan
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Input
            label="Nama Lengkap *"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Nomor WhatsApp *"
            type="tel"
            placeholder="0812-3456-7890"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            helperText="Nomor ini akan digunakan untuk login"
          />
          <Input
            label="Email (Opsional)"
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Alamat (Opsional)"
            placeholder="Alamat lengkap Anda"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Button className="w-full" onClick={handleRegister} loading={loading}>
            <UserPlus className="mr-2 h-4 w-4" />
            Daftar
          </Button>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Sudah punya akun? </span>
            <Link href="/login" className="text-primary hover:underline">
              Masuk
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
