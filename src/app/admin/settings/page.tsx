'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Save,
  Store,
  Truck,
  Clock,
  AlertTriangle,
  QrCode,
} from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    store_name: 'DapurPOS',
    store_phone: '0812-3456-7890',
    store_email: 'info@dapurpos.com',
    store_address: 'Jakarta, Indonesia',
    delivery_base_fee: 20000,
    delivery_base_distance: 3,
    delivery_extra_rate: 50000,
    delivery_extra_distance: 5,
    min_lead_time_default: 2,
    min_lead_time_25pack: 2,
    min_lead_time_50pack: 5,
    min_lead_time_kuekering: 15,
    min_lead_time_snack: 2,
    dp_percentage: 50,
    low_stock_threshold: 20,
    qris_image_url: 'https://qlwyfftatulvkjrnlpob.supabase.co/storage/v1/object/public/qris/WhatsApp%20Image%202026-08-20%20at%2010.05.04%20AM.jpeg',
    whatsapp_number: '0812-3456-7890',
  })

  const handleSave = () => {
    // Save to Supabase
    alert('Pengaturan berhasil disimpan!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">
            Konfigurasi sistem DapurPOS
          </p>
        </div>
        <Button onClick={handleSave}>
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
              onChange={(e) =>
                setSettings({ ...settings, store_name: e.target.value })
              }
            />
            <Input
              label="Telepon/WhatsApp"
              value={settings.store_phone}
              onChange={(e) =>
                setSettings({ ...settings, store_phone: e.target.value })
              }
            />
            <Input
              label="Email"
              type="email"
              value={settings.store_email}
              onChange={(e) =>
                setSettings({ ...settings, store_email: e.target.value })
              }
            />
            <Input
              label="Alamat"
              value={settings.store_address}
              onChange={(e) =>
                setSettings({ ...settings, store_address: e.target.value })
              }
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
              onChange={(e) =>
                setSettings({
                  ...settings,
                  delivery_base_fee: parseInt(e.target.value),
                })
              }
            />
            <Input
              label="Jarak Dasar (km)"
              type="number"
              value={settings.delivery_base_distance}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  delivery_base_distance: parseInt(e.target.value),
                })
              }
            />
            <Input
              label="Tarif Per 5km (Rp)"
              type="number"
              value={settings.delivery_extra_rate}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  delivery_extra_rate: parseInt(e.target.value),
                })
              }
            />
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">Formula:</p>
              <p className="text-muted-foreground">
                ≤{settings.delivery_base_distance}km = Rp {settings.delivery_base_fee.toLocaleString()}
              </p>
              <p className="text-muted-foreground">
                Setiap {settings.delivery_extra_distance}km = +Rp {settings.delivery_extra_rate.toLocaleString()}
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
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Waktu Minimum Pemesanan
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm text-muted-foreground">Default</p>
                  <p className="font-medium">H-{settings.min_lead_time_default}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm text-muted-foreground">25-50 pack</p>
                  <p className="font-medium">H-{settings.min_lead_time_25pack}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm text-muted-foreground">&gt;50 pack</p>
                  <p className="font-medium">H-{settings.min_lead_time_50pack}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm text-muted-foreground">Kue Kering</p>
                  <p className="font-medium">H-{settings.min_lead_time_kuekering}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm text-muted-foreground">Snack</p>
                  <p className="font-medium">H-{settings.min_lead_time_snack}</p>
                </div>
              </div>
            </div>

            <Input
              label="DP Percentage (%)"
              type="number"
              value={settings.dp_percentage}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  dp_percentage: parseInt(e.target.value),
                })
              }
            />
          </CardContent>
        </Card>

        {/* Inventory & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Inventaris & Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Batas Stok Rendah (%)"
              type="number"
              value={settings.low_stock_threshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  low_stock_threshold: parseInt(e.target.value),
                })
              }
              helperText="Peringatan jika stok di bawah persentase ini"
            />

            <Input
              label="URL Gambar QRIS"
              value={settings.qris_image_url}
              onChange={(e) =>
                setSettings({ ...settings, qris_image_url: e.target.value })
              }
              helperText="URL gambar QRIS untuk pembayaran DP"
            />

            <Input
              label="WhatsApp Number"
              value={settings.whatsapp_number}
              onChange={(e) =>
                setSettings({ ...settings, whatsapp_number: e.target.value })
              }
              helperText="Nomor WhatsApp untuk konfirmasi pembayaran"
            />

            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="h-4 w-4" />
                <span className="text-sm font-medium">Preview QRIS</span>
              </div>
              {settings.qris_image_url ? (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={settings.qris_image_url}
                    alt="QRIS Preview"
                    className="w-full max-w-[200px] mx-auto"
                  />
                </div>
              ) : (
                <div className="h-32 bg-background rounded flex items-center justify-center border border-dashed">
                  <span className="text-sm text-muted-foreground">
                    Upload gambar QRIS
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
