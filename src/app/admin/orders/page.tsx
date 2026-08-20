'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Eye,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Loader2,
} from 'lucide-react'
import { formatIDR, formatDateShort } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'destructive' | 'secondary' }> = {
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

const statusFilters = [
  { id: 'all', label: 'Semua' },
  { id: 'awaiting_dp', label: 'Menunggu DP' },
  { id: 'dp_confirmed', label: 'DP Dikonfirmasi' },
  { id: 'preparing', label: 'Disiapkan' },
  { id: 'ready', label: 'Siap' },
  { id: 'delivered', label: 'Terkirim' },
  { id: 'cancelled', label: 'Dibatalkan' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setOrders(data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter
    return matchesSearch && matchesFilter
  })

  const getFilterCount = (status: string) => {
    if (status === 'all') return orders.length
    return orders.filter((o) => o.status === status).length
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
      <div>
        <h1 className="text-2xl font-bold">Pesanan</h1>
        <p className="text-muted-foreground">Kelola semua pesanan masuk</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pesanan</p>
                <p className="text-xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Menunggu DP</p>
                <p className="text-xl font-bold">{orders.filter((o) => o.status === 'awaiting_dp').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Truck className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diproses</p>
                <p className="text-xl font-bold">{orders.filter((o) => ['preparing', 'ready', 'out_for_delivery'].includes(o.status)).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selesai</p>
                <p className="text-xl font-bold">{orders.filter((o) => o.status === 'done').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter.id ? 'bg-primary text-on-primary' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {filter.label}
            <Badge variant={activeFilter === filter.id ? 'secondary' : 'default'} className="ml-1">
              {getFilterCount(filter.id)}
            </Badge>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari pesanan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">No. Pesanan</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Menu</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Pengiriman</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <span className="font-medium">{order.order_number}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{order.rice_name}</p>
                        <p className="text-sm text-muted-foreground">{order.pack_qty} pack</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{formatIDR(order.grand_total)}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={statusConfig[order.status]?.variant || 'secondary'}>
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm">{order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateShort(order.delivery_date)},{' '}
                          {order.time_slot === 'pagi' ? 'Pagi' : order.time_slot === 'siang' ? 'Siang' : 'Sore'}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Link href={`/admin/orders/${order.id}`}>
                        <button className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
