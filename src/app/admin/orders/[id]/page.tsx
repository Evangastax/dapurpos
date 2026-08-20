'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  QrCode,
} from 'lucide-react'
import { formatIDR, formatDate, formatDateShort } from '@/lib/utils'
import Link from 'next/link'

// Mock data
const mockOrder = {
  id: '1',
  order_number: 'DP200820001',
  customer: {
    name: 'Budi Santoso',
    phone: '0812-3456-7890',
    email: 'budi@email.com',
    address: 'Jl. Sudirman No. 123, Jakarta Selatan',
  },
  rice: {
    name: 'Nasi Putih',
    price: 5000,
  },
  proteins: [
    { name: 'Ayam Goreng', price: 12000 },
    { name: 'Telur Balado', price: 8000 },
  ],
  addons: [
    { name: 'Sambal', price: 2000 },
    { name: 'Kerupuk', price: 2000 },
  ],
  pack_qty: 30,
  combo_price: 29000,
  subtotal: 870000,
  delivery_type: 'delivery',
  delivery_address: 'Jl. Sudirman No. 123, Jakarta Selatan',
  delivery_distance_km: 5,
  delivery_fee: 70000,
  grand_total: 940000,
  dp_amount: 470000,
  dp_paid_at: '2026-08-20T10:00:00Z',
  remaining_amount: 470000,
  remaining_paid_at: null,
  status: 'dp_confirmed',
  delivery_date: '2026-08-22',
  time_slot: 'siang',
  notes: 'Tolong sambalnya dipisah ya',
  created_at: '2026-08-20T09:30:00Z',
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'destructive' | 'secondary'; nextStatus?: string; nextLabel?: string }> = {
  awaiting_dp: {
    label: 'Menunggu DP',
    variant: 'warning',
    nextStatus: 'dp_confirmed',
    nextLabel: 'Konfirmasi DP',
  },
  dp_confirmed: {
    label: 'DP Dikonfirmasi',
    variant: 'info',
    nextStatus: 'preparing',
    nextLabel: 'Mulai Persiapan',
  },
  preparing: {
    label: 'Sedang Disiapkan',
    variant: 'info',
    nextStatus: 'ready',
    nextLabel: 'Siap',
  },
  ready: {
    label: 'Siap',
    variant: 'success',
    nextStatus: 'out_for_delivery',
    nextLabel: 'Kirim',
  },
  out_for_delivery: {
    label: 'Dalam Pengiriman',
    variant: 'info',
    nextStatus: 'delivered',
    nextLabel: 'Terkirim',
  },
  delivered: {
    label: 'Terkirim',
    variant: 'success',
    nextStatus: 'done',
    nextLabel: 'Selesai',
  },
  done: {
    label: 'Selesai',
    variant: 'success',
  },
  cancelled: {
    label: 'Dibatalkan',
    variant: 'destructive',
  },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(mockOrder)
  const [loading, setLoading] = useState(false)

  const config = statusConfig[order.status]

  const handleUpdateStatus = () => {
    if (!config.nextStatus) return
    setLoading(true)
    // Update status in Supabase
    setTimeout(() => {
      setOrder({ ...order, status: config.nextStatus as any })
      setLoading(false)
    }, 1000)
  }

  const handleConfirmPayment = () => {
    setLoading(true)
    // Confirm payment in Supabase
    setTimeout(() => {
      setOrder({
        ...order,
        status: 'dp_confirmed',
        dp_paid_at: new Date().toISOString(),
      })
      setLoading(false)
    }, 1000)
  }

  const handleCancelOrder = () => {
    if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
      setLoading(true)
      setTimeout(() => {
        setOrder({ ...order, status: 'cancelled' })
        setLoading(false)
      }, 1000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <button className="rounded-lg p-2 hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{order.order_number}</h1>
            <p className="text-muted-foreground">
              Detail pesanan
            </p>
          </div>
        </div>
        <Badge variant={config.variant} className="text-lg px-4 py-1.5">
          {config.label}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">{order.customer.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{order.customer.phone}</span>
              </div>
            </div>
            {order.delivery_type === 'delivery' && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{order.delivery_address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatDate(order.delivery_date)},{' '}
                {order.time_slot === 'pagi'
                  ? 'Pagi (08:00-11:00)'
                  : order.time_slot === 'siang'
                  ? 'Siang (11:00-14:00)'
                  : 'Sore (14:00-17:00)'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>
                {order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'}
                {order.delivery_type === 'delivery' &&
                  ` (${order.delivery_distance_km} km)`}
              </span>
            </div>
            {order.notes && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium mb-1">Catatan:</p>
                <p className="text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-lg">
                {formatIDR(order.grand_total)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">DP (50%)</span>
              <span className="font-medium">
                {formatIDR(order.dp_amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status DP</span>
              {order.dp_paid_at ? (
                <Badge variant="success">Dibayar</Badge>
              ) : (
                <Badge variant="warning">Belum</Badge>
              )}
            </div>
            {order.dp_paid_at && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Waktu Bayar DP</span>
                <span>{formatDate(order.dp_paid_at)}</span>
              </div>
            )}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sisa Pembayaran</span>
                <span className="font-medium">
                  {formatIDR(order.remaining_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground">Status</span>
                {order.remaining_paid_at ? (
                  <Badge variant="success">Lunas</Badge>
                ) : (
                  <Badge variant="warning">Belum dibayar</Badge>
                )}
              </div>
            </div>
            {order.status === 'awaiting_dp' && (
              <Button className="w-full" onClick={handleConfirmPayment} loading={loading}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Konfirmasi DP
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detail Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Rice */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Nasi: {order.rice.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.pack_qty} pack
                  </p>
                </div>
                <span className="font-medium">
                  {formatIDR(order.rice.price * order.pack_qty)}
                </span>
              </div>

              {/* Proteins */}
              {order.proteins.map((protein, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div>
                    <p className="font-medium">Protein: {protein.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.pack_qty} pack
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatIDR(protein.price * order.pack_qty)}
                  </span>
                </div>
              ))}

              {/* Addons */}
              {order.addons.map((addon, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div>
                    <p className="font-medium">Lauk: {addon.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.pack_qty} pack
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatIDR(addon.price * order.pack_qty)}
                  </span>
                </div>
              ))}

              {/* Delivery */}
              {order.delivery_type === 'delivery' && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <p className="font-medium">Ongkos Kirim</p>
                    <p className="text-sm text-muted-foreground">
                      {order.delivery_distance_km} km
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatIDR(order.delivery_fee)}
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="font-bold text-lg">Grand Total</span>
                <span className="font-bold text-lg text-primary">
                  {formatIDR(order.grand_total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {config.nextStatus && (
          <Button onClick={handleUpdateStatus} loading={loading}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {config.nextLabel}
          </Button>
        )}
        {order.status !== 'cancelled' && order.status !== 'done' && (
          <Button variant="destructive" onClick={handleCancelOrder}>
            <XCircle className="mr-2 h-4 w-4" />
            Batalkan Pesanan
          </Button>
        )}
        <a
          href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline">
            <Phone className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
        </a>
      </div>
    </div>
  )
}
