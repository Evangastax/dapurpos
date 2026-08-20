'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Save,
  Store,
  Truck,
  Clock,
  AlertTriangle,
  QrCode,
  Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    store_name: 'DapurPOS',
    store_phone: '0812-3456-7890',
    store_email: 'info@dapurpos.com',
    store_address: 'Jakarta, Indonesia',
    delivery_base_fee: '20000',
    delivery_base_distance: '3',
    delivery_extra_rate: '50000',
    dp_percentage: '50',
    low_stock_threshold: '20',
    qris_image_url: '',
    whatsapp_number: '0812-3456-7890',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('settings')
        .select('*')

      if (data) {
        const settingsMap: Record<string, string> = {}
        data.forEach(item => {
          settingsMap[item.key] = item.value
        })
        setSettings(prev => ({
          ...prev,
          ...settingsMap,
        }))
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value.toString(),
        updated_at: new Date().toISOString(),
      }))

      for (const update of updates) {
        await supabase
          .from('settings')
          .upsert(update, { onConflict: 'key' })
      }

      alert('Pengaturan berhasil disimpan!')
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">Konfigurasi sistem DapurPOS</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="mr-2 h-4 w-4" />
          Simpan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Store Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Informasi Toko
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nama Toko"
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
            />
            <Input
              label="Telepon/WhatsApp"
              value={settings.store_phone}
              onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={settings.store_email}
              onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
            />
            <Input
              label="Alamat"
              value={settings.store_address}
              onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Pengaturan Pengiriman
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Ongkos Kirim Dasar (Rp)"
              type="number"
              value={settings.delivery_base_fee}
              onChange={(e) => setSettings({ ...settings, delivery_base_fee: e.target.value })}
            />
            <Input
              label="Jarak Dasar (km)"
              type="number"
              value={settings.delivery_base_distance}
              onChange={(e) => setSettings({ ...settings, delivery_base_distance: e.target.value })}
            />
            <Input
              label="Tarif Per 5km (Rp)"
              type="number"
              value={settings.delivery_extra_rate}
              onChange={(e) => setSettings({ ...settings, delivery_extra_rate: e.target.value })}
            />
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">Formula:</p>
              <p className="text-muted-foreground">
                ≤{settings.delivery_base_distance}km = Rp {parseInt(settings.delivery_base_fee).toLocaleString()}
              </p>
              <p className="text-muted-foreground">
                Setiap 5km = +Rp {parseInt(settings.delivery_extra_rate).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Aturan Pemesanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="DP Percentage (%)"
              type="number"
              value={settings.dp_percentage}
              onChange={(e) => setSettings({ ...settings, dp_percentage: e.target.value })}
            />
            <Input
              label="Batas Stok Rendah (%)"
              type="number"
              value={settings.low_stock_threshold}
              onChange={(e) => setSettings({ ...settings, low_stock_threshold: e.target.value })}
              helperText="Peringatan jika stok di bawah persentase ini"
            />
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="URL Gambar QRIS"
              value={settings.qris_image_url}
              onChange={(e) => setSettings({ ...settings, qris_image_url: e.target.value })}
              helperText="URL gambar QRIS untuk pembayaran DP"
            />
            <Input
              label="WhatsApp Number"
              value={settings.whatsapp_number}
              onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
              helperText="Nomor WhatsApp untuk konfirmasi pembayaran"
            />
            {settings.qris_image_url && (
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="h-4 w-4" />
                  <span className="text-sm font-medium">Preview QRIS</span>
                </div>
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={settings.qris_image_url}
                    alt="QRIS Preview"
                    className="w-full max-w-[200px] mx-auto"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
