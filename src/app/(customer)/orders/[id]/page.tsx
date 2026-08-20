'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
  QrCode,
} from 'lucide-react'
import { formatIDR, formatDate, formatDateShort, canCancelOrder } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'destructive' }> = {
  awaiting_dp: { label: 'Menunggu DP', variant: 'warning' },
  dp_confirmed: { label: 'DP Dikonfirmasi', variant: 'info' },
  preparing: { label: 'Sedang Disiapkan', variant: 'info' },
  ready: { label: 'Siap', variant: 'success' },
  out_for_delivery: { label: 'Dalam Pengiriman', variant: 'info' },
  picked_up: { label: 'Sudah Diambil', variant: 'success' },
  delivered: { label: 'Terkirim', variant: 'success' },
  done: { label: 'Selesai', variant: 'success' },
  cancelled: { label: 'Dibatalkan', variant: 'destructive' },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchOrder()
  }, [user, params.id])

  async function fetchOrder() {
    setLoading(true)
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user?.id)
        .single()

      if (orderError) throw orderError

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', params.id)

      setOrder(orderData)
      if (itemsData) setItems(itemsData)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <p>Pesanan tidak ditemukan</p>
          <Link href="/orders">
            <Button className="mt-4">Kembali</Button>
          </Link>
        </div>
      </div>
    )
  }

  const config = statusConfig[order.status] || statusConfig.awaiting_dp
  const canCancel = order.status === 'awaiting_dp' && canCancelOrder(order.cancel_deadline)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/orders">
            <button className="rounded-lg p-2 hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{order.order_number}</h1>
            <p className="text-muted-foreground">Detail pesanan</p>
          </div>
          <Badge variant={config.variant} className="text-lg px-4 py-1.5">
            {config.label}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Status Info */}
          {order.status === 'awaiting_dp' && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-warning" />
                  <span className="font-medium text-warning">Menunggu Pembayaran DP</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Silakan bayar DP sebesar <strong>{formatIDR(order.dp_amount)}</strong> untuk mengkonfirmasi pesanan.
                </p>

                {/* QRIS Payment */}
                <div className="rounded-lg border border-border bg-background p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <QrCode className="h-5 w-5" />
                    <span className="font-medium">Scan QRIS untuk Bayar DP</span>
                  </div>
                  <div className="rounded-lg overflow-hidden mb-3">
                    <img
                      src="https://qlwyfftatulvkjrnlpob.supabase.co/storage/v1/object/public/qris/WhatsApp%20Image%202026-08-20%20at%2010.05.04%20AM.jpeg"
                      alt="QRIS DapurPOS"
                      className="w-full max-w-[250px] mx-auto"
                    />
                  </div>
                  <p className="text-sm font-medium text-primary mb-1">
                    Jumlah: {formatIDR(order.dp_amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Scan kode QR di atas menggunakan aplikasi banking Anda
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium mb-1">Setelah membayar:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Simpan bukti pembayaran</li>
                    <li>Admin akan memverifikasi pembayaran Anda</li>
                    <li>Status pesanan akan berubah setelah DP dikonfirmasi</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}

          {order.status === 'dp_confirmed' && (
            <Card className="border-info/50 bg-info/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-info" />
                  <span className="font-medium text-info">DP Sudah Dikonfirmasi</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pesanan Anda sedang diproses. Kami akan mengirimkan saat sudah siap.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informasi Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>{order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'}</span>
              </div>
              {order.delivery_type === 'delivery' && order.delivery_address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{order.delivery_address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(order.delivery_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {order.time_slot === 'pagi' ? 'Pagi (08:00-11:00)' : order.time_slot === 'siang' ? 'Siang (11:00-14:00)' : 'Sore (14:00-17:00)'}
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

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Detail Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.order_type === 'dessert' ? (
                  // Dessert order
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <p className="font-medium">{order.rice_name}</p>
                      <p className="text-sm text-muted-foreground">{order.pack_qty} pack</p>
                    </div>
                    <span className="font-medium">{formatIDR(order.rice_price * order.pack_qty)}</span>
                  </div>
                ) : (
                  // Main Course order
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div>
                        <p className="font-medium">Nasi: {order.rice_name}</p>
                        <p className="text-sm text-muted-foreground">{order.pack_qty} pack</p>
                      </div>
                      <span className="font-medium">{formatIDR(order.rice_price * order.pack_qty)}</span>
                    </div>

                    {items.filter((i) => i.item_type === 'protein').map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div>
                          <p className="font-medium">Protein: {item.item_name}</p>
                          <p className="text-sm text-muted-foreground">{order.pack_qty} pack</p>
                        </div>
                        <span className="font-medium">{formatIDR(item.price * order.pack_qty)}</span>
                      </div>
                    ))}

                    {items.filter((i) => i.item_type === 'addon').map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div>
                          <p className="font-medium">Lauk: {item.item_name}</p>
                          <p className="text-sm text-muted-foreground">{order.pack_qty} pack</p>
                        </div>
                        <span className="font-medium">{formatIDR(item.price * order.pack_qty)}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Packaging */}
                {order.packaging_type && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <p className="font-medium">Kemasan: {order.packaging_type}</p>
                      <p className="text-sm text-muted-foreground">{order.pack_qty} pack</p>
                    </div>
                    <span className="font-medium">{formatIDR(order.packaging_fee)}</span>
                  </div>
                )}

                {order.delivery_type === 'delivery' && order.delivery_fee > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <p className="font-medium">Ongkos Kirim</p>
                      <p className="text-sm text-muted-foreground">{order.delivery_distance_km} km</p>
                    </div>
                    <span className="font-medium">{formatIDR(order.delivery_fee)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="font-bold text-lg">Grand Total</span>
                  <span className="font-bold text-lg text-primary">{formatIDR(order.grand_total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">{formatIDR(order.grand_total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">DP (50%)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatIDR(order.dp_amount)}</span>
                    <Badge variant={order.dp_paid_at ? 'success' : 'warning'}>
                      {order.dp_paid_at ? 'Dibayar' : 'Belum'}
                    </Badge>
                  </div>
                </div>
                {order.dp_paid_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Waktu Bayar DP</span>
                    <span>{formatDate(order.dp_paid_at)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Sisa Pembayaran</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatIDR(order.remaining_amount)}</span>
                      <Badge variant={order.remaining_paid_at ? 'success' : 'warning'}>
                        {order.remaining_paid_at ? 'Lunas' : 'Belum'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
