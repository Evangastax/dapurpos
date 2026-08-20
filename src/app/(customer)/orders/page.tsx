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
  History,
} from 'lucide-react'
import { formatIDR, formatDateShort } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type OrderTab = 'status' | 'history'

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
  const [activeTab, setActiveTab] = useState<OrderTab>('status')

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

  // Split orders into status (active) and history (completed/cancelled)
  const activeStatuses = ['awaiting_dp', 'dp_confirmed', 'preparing', 'ready', 'out_for_delivery', 'picked_up', 'delivered']
  const historyStatuses = ['done', 'cancelled']

  const statusOrders = orders.filter(o => activeStatuses.includes(o.status))
  const historyOrders = orders.filter(o => historyStatuses.includes(o.status))

  const displayOrders = activeTab === 'status' ? statusOrders : historyOrders

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
        <h1 className="font-heading text-3xl font-bold mb-6">Pesanan Saya</h1>

        {/* Tabs */}
        <div className="flex rounded-lg bg-muted p-1 mb-6">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'status'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <Package className="inline-block mr-2 h-4 w-4" />
            Status Pesanan
            {statusOrders.length > 0 && (
              <Badge variant="secondary" className="ml-2">{statusOrders.length}</Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <History className="inline-block mr-2 h-4 w-4" />
            History
            {historyOrders.length > 0 && (
              <Badge variant="secondary" className="ml-2">{historyOrders.length}</Badge>
            )}
          </button>
        </div>

        {/* Orders List */}
        {displayOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">
                {activeTab === 'status' ? 'Tidak ada pesanan aktif' : 'Belum ada history'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {activeTab === 'status' ? 'Mulai pesan nasi kotak untuk acara Anda' : 'Pesanan yang selesai akan muncul di sini'}
              </p>
              {activeTab === 'status' && (
                <Link href="/menu">
                  <Button>Pesan Sekarang</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayOrders.map(order => {
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
                        <span>{order.order_type === 'dessert' ? order.rice_name : `${order.rice_name} + Protein + Lauk`}</span>
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
                    </div>

                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Detail
                      </Button>
                    </Link>
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
