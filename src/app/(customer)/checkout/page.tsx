'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Clock,
  Truck,
  Store,
  Calendar,
  AlertTriangle,
  QrCode,
  CheckCircle,
} from 'lucide-react'
import { formatIDR, calculateDeliveryFee, formatDate } from '@/lib/utils'

// Mock combo data (should come from state/context)
const mockCombo = {
  rice: { name: 'Nasi Putih', price: 5000 },
  proteins: [
    { name: 'Ayam Goreng', price: 12000 },
    { name: 'Telur Balado', price: 8000 },
  ],
  addons: [
    { name: 'Sambal', price: 2000 },
    { name: 'Kerupuk', price: 2000 },
  ],
  quantity: 30,
}

const timeSlots = [
  { id: 'pagi', label: 'Pagi', time: '08:00-11:00', icon: '🌅' },
  { id: 'siang', label: 'Siang', time: '11:00-14:00', icon: '☀️' },
  { id: 'sore', label: 'Sore', time: '14:00-17:00', icon: '🌇' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
  const [address, setAddress] = useState('')
  const [distance, setDistance] = useState(2)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [notes, setNotes] = useState('')
  const [showQRIS, setShowQRIS] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const comboPrice =
    mockCombo.rice.price +
    mockCombo.proteins.reduce((sum, p) => sum + p.price, 0) +
    mockCombo.addons.reduce((sum, a) => sum + a.price, 0)

  const subtotal = comboPrice * mockCombo.quantity
  const deliveryFee = deliveryType === 'delivery' ? calculateDeliveryFee(distance).total_fee : 0
  const grandTotal = subtotal + deliveryFee
  const dpAmount = grandTotal * 0.5

  const getMinDate = () => {
    const today = new Date()
    const minLeadTime = mockCombo.quantity > 50 ? 5 : mockCombo.quantity > 25 ? 2 : 2
    today.setDate(today.getDate() + minLeadTime)
    return today.toISOString().split('T')[0]
  }

  const handlePlaceOrder = () => {
    // Validate
    if (deliveryType === 'delivery' && !address) {
      alert('Alamat pengiriman harus diisi')
      return
    }
    if (!selectedDate) {
      alert('Tanggal pengiriman harus dipilih')
      return
    }
    if (!selectedSlot) {
      alert('Waktu pengiriman harus dipilih')
      return
    }

    // Show QRIS
    setShowQRIS(true)
  }

  const handleConfirmPayment = () => {
    // Save order to Supabase
    setOrderPlaced(true)
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 mx-auto">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">
            Pesanan Berhasil!
          </h1>
          <p className="text-muted-foreground mb-6">
            Pesanan Anda telah diterima. Silakan bayar DP untuk konfirmasi.
          </p>
          <div className="rounded-lg bg-muted p-4 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Pesanan</span>
                <span className="font-medium">DP200820099</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{formatIDR(grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DP yang harus dibayar</span>
                <span className="font-medium text-primary">{formatIDR(dpAmount)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push('/orders')}>
              Lihat Pesanan
            </Button>
            <Button className="flex-1" onClick={() => router.push('/menu')}>
              Pesan Lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (showQRIS) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Pembayaran DP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Jumlah yang harus dibayar
                </p>
                <p className="text-3xl font-bold text-primary">
                  {formatIDR(dpAmount)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  DP 50% dari total {formatIDR(grandTotal)}
                </p>
              </div>

              {/* QRIS */}
              <div className="rounded-lg border border-border p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <QrCode className="h-5 w-5" />
                  <span className="font-medium">Scan QRIS</span>
                </div>
                <div className="rounded-lg overflow-hidden">
                  <img
                    src="https://qlwyfftatulvkjrnlpob.supabase.co/storage/v1/object/public/qris/WhatsApp%20Image%202026-08-20%20at%2010.05.04%20AM.jpeg"
                    alt="QRIS DapurPOS"
                    className="w-full max-w-xs mx-auto"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Scan kode QR di atas menggunakan aplikasi banking Anda
                </p>
              </div>

              {/* Instructions */}
              <div className="rounded-lg bg-info/10 border border-info/20 p-4 text-sm">
                <p className="font-medium text-info mb-2">Instruksi Pembayaran:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Scan kode QRIS di atas</li>
                  <li>Bayar sesuai nominal yang tertera</li>
                  <li>Simpan bukti pembayaran</li>
                  <li>Admin akan mengkonfirmasi pembayaran Anda</li>
                </ol>
              </div>

              {/* Confirm button */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowQRIS(false)}
                >
                  Kembali
                </Button>
                <Button className="flex-1" onClick={handleConfirmPayment}>
                  Saya Sudah Bayar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-heading text-3xl font-bold mb-8 text-center">
          Checkout
        </h1>

        <div className="space-y-6">
          {/* Delivery Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Tipe Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    deliveryType === 'delivery'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Truck className="h-6 w-6" />
                  <span className="font-medium">Delivery</span>
                  <span className="text-xs text-muted-foreground">
                    Diantar ke lokasi
                  </span>
                </button>
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    deliveryType === 'pickup'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Store className="h-6 w-6" />
                  <span className="font-medium">Pickup</span>
                  <span className="text-xs text-muted-foreground">
                    Ambil sendiri
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Address (if delivery) */}
          {deliveryType === 'delivery' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Alamat Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Alamat Lengkap"
                  placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Input
                  label="Jarak dari Dapur (km)"
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                  helperText="Perkiraan jarak untuk hitung ongkir"
                />
                {distance > 0 && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">Ongkos Kirim</p>
                    <p className="text-lg font-bold text-primary">
                      {formatIDR(calculateDeliveryFee(distance).total_fee)}
                    </p>
                    {distance > 3 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Base {formatIDR(20000)} + {formatIDR(calculateDeliveryFee(distance).extra_fee)} (jarak {distance}km)
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tanggal & Waktu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Tanggal Pengiriman"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
              />
              {mockCombo.quantity > 25 && (
                <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="font-medium text-warning">
                      Minimal H-{mockCombo.quantity > 50 ? '5' : '2'}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    Pesanan {mockCombo.quantity} pack harus dipesan minimal {mockCombo.quantity > 50 ? '5' : '2'} hari sebelumnya
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Waktu Pengiriman
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${
                        selectedSlot === slot.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-lg">{slot.icon}</span>
                      <span className="font-medium text-sm">{slot.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {slot.time}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Catatan (Opsional)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
                placeholder="Tambahkan catatan untuk pesanan Anda..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Combo</span>
                  <span>{formatIDR(comboPrice)}/pack</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah</span>
                  <span>{mockCombo.quantity} pack</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatIDR(subtotal)}</span>
                </div>
                {deliveryType === 'delivery' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ongkir</span>
                    <span>{formatIDR(deliveryFee)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatIDR(grandTotal)}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-primary/5 p-3">
                  <div className="flex justify-between">
                    <span className="text-sm">DP yang harus dibayar (50%)</span>
                    <span className="font-bold text-primary">
                      {formatIDR(dpAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Place Order */}
          <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
            Bayar DP {formatIDR(dpAmount)}
          </Button>
        </div>
      </div>
    </div>
  )
}
