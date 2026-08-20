'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingBag,
  DollarSign,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { formatIDR, formatDateShort } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'destructive' | 'secondary' }> = {
  awaiting_dp: { label: 'Menunggu DP', variant: 'warning' },
  dp_confirmed: { label: 'DP Dikonfirmasi', variant: 'info' },
  preparing: { label: 'Sedang Disiapkan', variant: 'info' },
  ready: { label: 'Siap', variant: 'success' },
  out_for_delivery: { label: 'Dalam Pengiriman', variant: 'info' },
  delivered: { label: 'Terkirim', variant: 'success' },
  done: { label: 'Selesai', variant: 'success' },
  cancelled: { label: 'Dibatalkan', variant: 'destructive' },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingDp: 0,
    lowStock: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString()

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch ingredients
      const { data: ingredients } = await supabase
        .from('ingredients')
        .select('*')

      // Calculate stats
      const todayOrders = orders?.filter(o => 
        new Date(o.created_at) >= today && o.status !== 'cancelled'
      ) || []

      const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.grand_total || 0), 0)

      const pendingDp = orders?.filter(o => o.status === 'awaiting_dp') || []

      const lowStock = ingredients?.filter(i => 
        i.min_stock_alert && i.stock_qty <= i.min_stock_alert
      ) || []

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        pendingDp: pendingDp.length,
        lowStock: lowStock.length,
      })

      setRecentOrders(orders?.slice(0, 5) || [])
      setLowStockItems(lowStock)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
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
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan aktivitas hari ini</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Hari Ini</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(stats.todayRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu DP</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDp}</div>
            <p className="text-xs text-muted-foreground">Perlu konfirmasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Item perlu restock</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pesanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Belum ada pesanan</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{order.pack_qty} pack</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatIDR(order.grand_total)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateShort(order.delivery_date)}
                        </p>
                      </div>
                      <Badge variant={statusConfig[order.status]?.variant || 'secondary'}>
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-warning/20 bg-warning/5 p-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-warning">
                      Sisa {item.stock_qty} {item.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Min: {item.min_stock_alert} {item.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
