'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Save,
  LogOut,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const { user, login, logout } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchProfile()
  }, [user])

  async function fetchProfile() {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
        })
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!user) return

    setSaving(true)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          email: formData.email || null,
          address: formData.address || null,
        })
        .eq('id', user.id)

      if (error) throw error

      // Update local user state
      login({
        ...user,
        name: formData.name,
        email: formData.email,
        address: formData.address,
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    logout()
    window.location.href = '/'
  }

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="font-heading text-3xl font-bold mb-8 text-center">
          Profile Saya
        </h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {success && (
              <div className="rounded-lg bg-success/10 border border-success/20 p-3 text-sm text-success flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Profile berhasil disimpan!
              </div>
            )}

            <Input
              label="Nama Lengkap"
              placeholder="Nama lengkap Anda"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Nomor WhatsApp"
              type="tel"
              placeholder="0812-3456-7890"
              value={formData.phone}
              disabled
              helperText="Nomor telepon tidak dapat diubah"
            />

            <Input
              label="Email (Opsional)"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Alamat Pengiriman
              </label>
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
                placeholder="Alamat lengkap untuk pengiriman"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <p className="mt-1.5 text-sm text-muted-foreground">
                Alamat ini akan digunakan sebagai default saat checkout
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={handleSave} loading={saving}>
                <Save className="mr-2 h-4 w-4" />
                Simpan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
