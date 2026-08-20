'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MapPin,
  Truck,
  Store,
  Calendar,
  QrCode,
  CheckCircle,
  Loader2,
  Package,
} from 'lucide-react'
import { formatIDR, calculateDeliveryFee, generateOrderNumber, getCancelDeadline } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/types'

interface MainCourseCombo {
  type: 'maincourse'
  rice: MenuItem
  proteins: MenuItem[]
  addons: MenuItem[]
  quantity: number
  comboPrice: number
  subtotal: number
}

interface DessertCombo {
  type: 'dessert'
  dessert: MenuItem
  quantity: number
  comboPrice: number
  subtotal: number
}

type ComboData = MainCourseCombo | DessertCombo

interface PackagingOption {
  id: string
  name: string
  description: string
  price: number
}

const timeSlots = [
  { id: 'pagi', label: 'Pagi', time: '08:00-11:00' },
  { id: 'siang', label: 'Siang', time: '11:00-14:00' },
  { id: 'sore', label: 'Sore', time: '14:00-17:00' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [combo, setCombo] = useState<ComboData | null>(null)
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
  const [address, setAddress] = useState('')
  const [distance, setDistance] = useState(3)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [notes, setNotes] = useState('')
  const [showQRIS, setShowQRIS] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [packagingOptions, setPackagingOptions] = useState<PackagingOption[]>([])
  const [selectedPackaging, setSelectedPackaging] = useState<PackagingOption | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const stored = localStorage.getItem('dapurpos_combo')
    if (stored) {
      try {
        setCombo(JSON.parse(stored))
      } catch {
        router.push('/menu')
      }
    } else {
      router.push('/menu')
    }

    fetchPackaging()
  }, [user])

  async function fetchPackaging() {
    try {
      const { data } = await supabase
        .from('packaging_options')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (data) setPackagingOptions(data)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  if (!combo || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const comboData = combo
  const packagingFee = selectedPackaging ? selectedPackaging.price * comboData.quantity : 0
  const deliveryFee = deliveryType === 'delivery' ? calculateDeliveryFee(distance).total_fee : 0
  const grandTotal = comboData.subtotal + packagingFee + deliveryFee
  const dpAmount = grandTotal * 0.5

  function getMinDate() {
    const today = new Date()
    const minLeadTime = comboData.quantity > 50 ? 5 : comboData.quantity > 25 ? 2 : 2
    today.setDate(today.getDate() + minLeadTime)
    return today.toISOString().split('T')[0]
  }

  async function handlePlaceOrder() {
    if (!user || !comboData) return

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
    if (!selectedPackaging) {
      alert('Pilih kemasan terlebih dahulu')
      return
    }

    setShowQRIS(true)
  }

  async function handleConfirmPayment() {
    setLoading(true)

    try {
      const newOrderNumber = generateOrderNumber()
      const cancelDeadline = getCancelDeadline(selectedDate, comboData.quantity)

      let orderData: any = {
        user_id: user!.id,
        order_number: newOrderNumber,
        pack_qty: comboData.quantity,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? address : null,
        delivery_distance_km: deliveryType === 'delivery' ? distance : null,
        delivery_fee: deliveryFee,
        packaging_type: selectedPackaging?.name,
        packaging_fee: packagingFee,
        time_slot: selectedSlot,
        delivery_date: selectedDate,
        grand_total: grandTotal,
        dp_amount: dpAmount,
        remaining_amount: grandTotal - dpAmount,
        status: 'awaiting_dp',
        cancel_deadline: cancelDeadline.toISOString().split('T')[0],
        notes: notes || null,
      }

      if (comboData.type === 'maincourse') {
        orderData = {
          ...orderData,
          order_type: 'maincourse',
          rice_id: comboData.rice.id,
          rice_name: comboData.rice.name,
          rice_price: comboData.rice.price,
          combo_price: comboData.comboPrice,
          subtotal: comboData.subtotal,
        }
      } else {
        orderData = {
          ...orderData,
          order_type: 'dessert',
          rice_id: null,
          rice_name: comboData.dessert.name,
          rice_price: comboData.dessert.price,
          combo_price: comboData.dessert.price,
          subtotal: comboData.subtotal,
        }
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems: any[] = []

      if (comboData.type === 'maincourse') {
        comboData.proteins.forEach(p => {
          orderItems.push({
            order_id: order.id,
            item_type: 'protein',
            item_id: p.id,
            item_name: p.name,
            price: p.price,
          })
        })
        comboData.addons.forEach(a => {
          orderItems.push({
            order_id: order.id,
            item_type: 'addon',
            item_id: a.id,
            item_name: a.name,
            price: a.price,
          })
        })
      } else {
        orderItems.push({
          order_id: order.id,
          item_type: 'dessert',
          item_id: comboData.dessert.id,
          item_name: comboData.dessert.name,
          price: comboData.dessert.price,
        })
      }

      if (orderItems.length > 0) {
        await supabase.from('order_items').insert(orderItems)
      }

      // Create payment record
      await supabase.from('payments').insert({
        order_id: order.id,
        payment_type: 'dp',
        amount: dpAmount,
        method: 'qris',
      })

      setOrderNumber(newOrderNumber)
      setOrderPlaced(true)
      localStorage.removeItem('dapurpos_combo')
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 mx-auto">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">Pesanan Berhasil!</h1>
          <p className="text-muted-foreground mb-6">Pesanan Anda telah diterima.</p>
          <div className="rounded-lg bg-muted p-4 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Pesanan</span>
                <span className="font-medium">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{formatIDR(grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DP</span>
                <span className="font-medium text-primary">{formatIDR(dpAmount)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push('/orders')}>Lihat Pesanan</Button>
            <Button className="flex-1" onClick={() => router.push('/menu')}>Pesan Lagi</Button>
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
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Jumlah yang harus dibayar</p>
                <p className="text-3xl font-bold text-primary">{formatIDR(dpAmount)}</p>
                <p className="text-sm text-muted-foreground mt-1">DP 50% dari total {formatIDR(grandTotal)}</p>
              </div>

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
              </div>

              <div className="rounded-lg bg-info/10 border border-info/20 p-4 text-sm">
                <p className="font-medium text-info mb-2">Instruksi Pembayaran:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Scan kode QRIS di atas</li>
                  <li>Bayar sesuai nominal yang tertera</li>
                  <li>Simpan bukti pembayaran</li>
                  <li>Admin akan mengkonfirmasi via WhatsApp</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowQRIS(false)}>Kembali</Button>
                <Button className="flex-1" onClick={handleConfirmPayment} loading={loading}>Saya Sudah Bayar</Button>
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
        <h1 className="font-heading text-3xl font-bold mb-8 text-center">Checkout</h1>

        <div className="space-y-6">
          {/* Combo Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{comboData.type === 'maincourse' ? 'Main Course' : 'Dessert'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {comboData.type === 'maincourse' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nasi</span>
                      <span>{comboData.rice.name} ({formatIDR(comboData.rice.price)})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Protein</span>
                      <span>{comboData.proteins.map(p => p.name).join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lauk</span>
                      <span>{comboData.addons.length > 0 ? comboData.addons.map(a => a.name).join(', ') : '-'}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kue</span>
                    <span>{comboData.dessert.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga/pack</span>
                  <span>{formatIDR(comboData.comboPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah</span>
                  <span>{comboData.quantity} pack</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-border">
                  <span>Subtotal Menu</span>
                  <span className="text-primary">{formatIDR(comboData.subtotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Packaging */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Kemasan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {packagingOptions.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackaging(pkg)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                      selectedPackaging?.id === pkg.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Package className="h-6 w-6" />
                    <span className="font-medium text-sm">{pkg.name}</span>
                    <span className="text-xs text-muted-foreground">{formatIDR(pkg.price)}/pack</span>
                  </button>
                ))}
              </div>
              {selectedPackaging && (
                <div className="mt-3 rounded-lg bg-muted p-3">
                  <p className="text-sm">
                    Biaya kemasan: {formatIDR(selectedPackaging.price)} × {comboData.quantity} pack = {formatIDR(packagingFee)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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
                    deliveryType === 'delivery' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Truck className="h-6 w-6" />
                  <span className="font-medium">Delivery</span>
                </button>
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    deliveryType === 'pickup' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Store className="h-6 w-6" />
                  <span className="font-medium">Pickup</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
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
                  placeholder="Jl. Contoh No. 123"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Input
                  label="Jarak (km)"
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                />
                {distance > 0 && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">Ongkos Kirim: {formatIDR(calculateDeliveryFee(distance).total_fee)}</p>
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
              <div>
                <label className="block text-sm font-medium mb-2">Waktu</label>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${
                        selectedSlot === slot.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="font-medium text-sm">{slot.label}</span>
                      <span className="text-xs text-muted-foreground">{slot.time}</span>
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
                placeholder="Tambahkan catatan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Menu</span>
                  <span>{formatIDR(comboData.subtotal)}</span>
                </div>
                {selectedPackaging && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kemasan ({selectedPackaging.name})</span>
                    <span>{formatIDR(packagingFee)}</span>
                  </div>
                )}
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
                    <span className="text-sm">DP (50%)</span>
                    <span className="font-bold text-primary">{formatIDR(dpAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
            Bayar DP {formatIDR(dpAmount)}
          </Button>
        </div>
      </div>
    </div>
  )
}
