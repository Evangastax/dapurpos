'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  Eye,
  XCircle,
  Loader2,
} from 'lucide-react'
import { formatIDR, formatDateShort } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'destructive' | 'secondary'; icon: any }> = {
  awaiting_dp: { label: 'Menunggu DP', variant: 'warning', icon: Clock },
  dp_confirmed: { label: 'DP Dikonfirmasi', variant: 'info', icon: CheckCircle },
  preparing: { label: 'Sedang Disiapkan', variant: 'info', icon: Package },
  ready: { label: 'Siap', variant: 'success', icon: CheckCircle },
  out_for_delivery: { label: 'Dalam Pengiriman', variant: 'info', icon: Truck },
  picked_up: { label: 'Sudah Diambil', variant: 'success', icon: CheckCircle },
  delivered: { label: 'Terkirim', variant: 'success', icon: CheckCircle },
  done: { label: 'Selesai', variant: 'success', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan', variant: 'destructive', icon: XCircle },
}

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchOrders()
  }, [user])

  async function fetchOrders() {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setOrders(data)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-heading text-3xl font-bold mb-8">Pesanan Saya</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Belum ada pesanan</h2>
              <p className="text-muted-foreground mb-4">Mulai pesan nasi kotak untuk acara Anda</p>
              <Link href="/menu">
                <Button>Pesan Sekarang</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.awaiting_dp
              const StatusIcon = config.icon

              return (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateShort(order.created_at)}
                        </p>
                      </div>
                      <Badge variant={config.variant}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Menu</span>
                        <span>{order.rice_name} + Protein + Lauk</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Jumlah</span>
                        <span>{order.pack_qty} pack</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-medium">{formatIDR(order.grand_total)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pengiriman</span>
                        <span>
                          {order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'} -{' '}
                          {formatDateShort(order.delivery_date)},{' '}
                          {order.time_slot === 'pagi' ? 'Pagi' : order.time_slot === 'siang' ? 'Siang' : 'Sore'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">DP</span>
                        <Badge variant={order.dp_paid_at ? 'success' : 'warning'}>
                          {order.dp_paid_at ? 'Sudah Dibayar' : 'Belum Dibayar'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/orders/${order.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Detail
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
