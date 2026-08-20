'use client'

import { useState, useEffect } from 'react'
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
  Loader2,
} from 'lucide-react'
import { formatIDR, formatDate, formatDateShort, canCancelOrder } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'destructive' | 'secondary'; nextStatus?: string; nextLabel?: string }> = {
  awaiting_dp: { label: 'Menunggu DP', variant: 'warning', nextStatus: 'dp_confirmed', nextLabel: 'Konfirmasi DP' },
  dp_confirmed: { label: 'DP Dikonfirmasi', variant: 'info', nextStatus: 'preparing', nextLabel: 'Mulai Persiapan' },
  preparing: { label: 'Sedang Disiapkan', variant: 'info', nextStatus: 'ready', nextLabel: 'Siap' },
  ready: { label: 'Siap', variant: 'success', nextStatus: 'out_for_delivery', nextLabel: 'Kirim' },
  out_for_delivery: { label: 'Dalam Pengiriman', variant: 'info', nextStatus: 'delivered', nextLabel: 'Terkirim' },
  delivered: { label: 'Terkirim', variant: 'success', nextStatus: 'done', nextLabel: 'Selesai' },
  done: { label: 'Selesai', variant: 'success' },
  cancelled: { label: 'Dibatalkan', variant: 'destructive' },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  async function fetchOrder() {
    setLoading(true)
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single()

      if (orderError) throw orderError

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', params.id)

      // Get customer info
      if (orderData?.user_id) {
        const { data: customerData } = await supabase
          .from('users')
          .select('*')
          .eq('id', orderData.user_id)
          .single()

        if (customerData) setCustomer(customerData)
      }

      setOrder(orderData)
      if (itemsData) setItems(itemsData)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus() {
    if (!order) return
    const config = statusConfig[order.status]
    if (!config.nextStatus) return

    setUpdating(true)
    try {
      const updates: any = { status: config.nextStatus }

      if (config.nextStatus === 'dp_confirmed') {
        updates.dp_paid_at = new Date().toISOString()
      } else if (config.nextStatus === 'done') {
        updates.remaining_paid_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', order.id)

      if (error) throw error
      await fetchOrder()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  async function confirmDp() {
    if (!order) return
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'dp_confirmed',
          dp_paid_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      if (error) throw error
      await fetchOrder()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  async function cancelOrder() {
    if (!order) return
    if (!confirm('Batalkan pesanan ini?')) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id)

      if (error) throw error
      await fetchOrder()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p>Pesanan tidak ditemukan</p>
        <Link href="/admin/orders">
          <Button className="mt-4">Kembali</Button>
        </Link>
      </div>
    )
  }

  const config = statusConfig[order.status] || statusConfig.awaiting_dp

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
            <p className="text-muted-foreground">Detail pesanan</p>
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
              <p className="font-medium">{customer?.name || 'Unknown'}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{customer?.phone || '-'}</span>
              </div>
            </div>
            {order.delivery_type === 'delivery' && order.delivery_address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{order.delivery_address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatDate(order.delivery_date)},{' '}
                {order.time_slot === 'pagi' ? 'Pagi (08:00-11:00)' : order.time_slot === 'siang' ? 'Siang (11:00-14:00)' : 'Sore (14:00-17:00)'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>
                {order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'}
                {order.delivery_type === 'delivery' && order.delivery_distance_km && ` (${order.delivery_distance_km} km)`}
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
            <CardTitle>Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-lg">{formatIDR(order.grand_total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">DP (50%)</span>
              <span className="font-medium">{formatIDR(order.dp_amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status DP</span>
              <Badge variant={order.dp_paid_at ? 'success' : 'warning'}>
                {order.dp_paid_at ? 'Dibayar' : 'Belum'}
              </Badge>
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
                <span className="font-medium">{formatIDR(order.remaining_amount)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={order.remaining_paid_at ? 'success' : 'warning'}>
                  {order.remaining_paid_at ? 'Lunas' : 'Belum dibayar'}
                </Badge>
              </div>
            </div>
            {order.status === 'awaiting_dp' && (
              <Button className="w-full" onClick={confirmDp} loading={updating}>
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
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {config.nextStatus && (
          <Button onClick={updateStatus} loading={updating}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {config.nextLabel}
          </Button>
        )}
        {order.status !== 'cancelled' && order.status !== 'done' && (
          <Button variant="destructive" onClick={cancelOrder} loading={updating}>
            <XCircle className="mr-2 h-4 w-4" />
            Batalkan Pesanan
          </Button>
        )}
        {customer?.phone && (
          <a
            href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">
              <Phone className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          </a>
        )}
      </div>
    </div>
  )
}
