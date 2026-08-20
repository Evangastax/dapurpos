'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingUp,
  Clock,
  CreditCard,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'
import { formatIDR, formatDateShort } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export default function FinancePage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    dpCollected: 0,
    remainingPending: 0,
  })
  const [recentPayments, setRecentPayments] = useState<any[]>([])
  const [outstandingPayments, setOutstandingPayments] = useState<any[]>([])
  const [revenueByDate, setRevenueByDate] = useState<{ date: string; revenue: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinanceData()
  }, [])

  async function fetchFinanceData() {
    setLoading(true)
    try {
      // Fetch all non-cancelled orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .not('status', 'eq', 'cancelled')
        .order('created_at', { ascending: false })

      if (!orders) return

      // Calculate stats
      const totalRevenue = orders.reduce((sum, o) => sum + (o.grand_total || 0), 0)
      const totalOrders = orders.length
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // DP collected
      const dpCollected = orders
        .filter(o => o.dp_paid_at)
        .reduce((sum, o) => sum + (o.dp_amount || 0), 0)

      // Remaining pending
      const remainingPending = orders
        .filter(o => !o.remaining_paid_at && o.status !== 'awaiting_dp')
        .reduce((sum, o) => sum + (o.remaining_amount || 0), 0)

      setStats({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        dpCollected,
        remainingPending,
      })

      // Revenue by date (last 7 days)
      const last7Days = new Date()
      last7Days.setDate(last7Days.getDate() - 7)

      const revenueMap: Record<string, number> = {}
      orders.forEach(order => {
        const date = order.created_at.split('T')[0]
        if (new Date(date) >= last7Days) {
          revenueMap[date] = (revenueMap[date] || 0) + order.grand_total
        }
      })

      const revenueData = Object.entries(revenueMap)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date))

      setRevenueByDate(revenueData)

      // Recent payments (orders with DP paid)
      const recentDp = orders
        .filter(o => o.dp_paid_at)
        .slice(0, 5)
        .map(o => ({
          id: o.id,
          order_number: o.order_number,
          amount: o.dp_amount,
          type: 'dp',
          method: 'QRIS',
          status: 'confirmed',
          date: o.dp_paid_at,
        }))

      setRecentPayments(recentDp)

      // Outstanding payments
      const outstanding = orders
        .filter(o => !o.remaining_paid_at && !['awaiting_dp', 'cancelled', 'done'].includes(o.status))
        .map(o => ({
          id: o.id,
          order_number: o.order_number,
          remaining: o.remaining_amount,
          due_date: o.delivery_date,
        }))

      setOutstandingPayments(outstanding)
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

  const maxRevenue = Math.max(...revenueByDate.map(d => d.revenue), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Keuangan</h1>
        <p className="text-muted-foreground">Laporan pendapatan dan pembayaran</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                <p className="text-xl font-bold">{formatIDR(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <TrendingUp className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pesanan</p>
                <p className="text-xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CreditCard className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata/Pesanan</p>
                <p className="text-xl font-bold">{formatIDR(stats.avgOrderValue)}</p>
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
                <p className="text-sm text-muted-foreground">Belum Dibayar</p>
                <p className="text-xl font-bold">{formatIDR(stats.remainingPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      {revenueByDate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pendapatan 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-2">
              {revenueByDate.map((day, index) => {
                const height = (day.revenue / maxRevenue) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative">
                      <div
                        className="w-full bg-primary/80 rounded-t-lg transition-all hover:bg-primary"
                        style={{ height: `${height * 2}px` }}
                      />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                        {formatIDR(day.revenue)}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {day.date.split('-').slice(1).join('/')}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Pembayaran Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Belum ada pembayaran</p>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium">{payment.order_number}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="success" className="text-xs">DP</Badge>
                        <span className="text-xs text-muted-foreground">{payment.method}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-success">+{formatIDR(payment.amount)}</p>
                      <p className="text-xs text-muted-foreground">{formatDateShort(payment.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outstanding Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Pembayaran Tertunggak
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outstandingPayments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Tidak ada pembayaran tertunggak</p>
            ) : (
              <div className="space-y-4">
                {outstandingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-lg border border-warning/20 bg-warning/5 p-3">
                    <div>
                      <p className="font-medium">{payment.order_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-warning">{formatIDR(payment.remaining)}</p>
                      <p className="text-xs text-muted-foreground">
                        Jatuh tempo: {formatDateShort(payment.due_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
