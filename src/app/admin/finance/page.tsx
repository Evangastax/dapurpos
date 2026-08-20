'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { formatIDR, formatDateShort } from '@/lib/utils'

// Mock data for charts
const revenueData = [
  { date: '14 Agu', revenue: 1500000, orders: 6 },
  { date: '15 Agu', revenue: 2200000, orders: 9 },
  { date: '16 Agu', revenue: 1800000, orders: 7 },
  { date: '17 Agu', revenue: 3100000, orders: 12 },
  { date: '18 Agu', revenue: 2800000, orders: 11 },
  { date: '19 Agu', revenue: 2400000, orders: 10 },
  { date: '20 Agu', revenue: 2450000, orders: 12 },
]

const recentPayments = [
  {
    id: '1',
    order_number: 'DP200820001',
    customer: 'Budi Santoso',
    amount: 375000,
    type: 'dp',
    method: 'QRIS',
    status: 'confirmed',
    date: '2026-08-20T10:00:00Z',
  },
  {
    id: '2',
    order_number: 'DP200820005',
    customer: 'Rudi Hermawan',
    amount: 172500,
    type: 'remaining',
    method: 'Transfer',
    status: 'confirmed',
    date: '2026-08-19T14:00:00Z',
  },
  {
    id: '3',
    order_number: 'DP200820003',
    customer: 'Ahmad Hidayat',
    amount: 220000,
    type: 'dp',
    method: 'QRIS',
    status: 'confirmed',
    date: '2026-08-19T13:00:00Z',
  },
  {
    id: '4',
    order_number: 'DP200820004',
    customer: 'Dewi Lestari',
    amount: 1250000,
    type: 'dp',
    method: 'QRIS',
    status: 'confirmed',
    date: '2026-08-18T16:00:00Z',
  },
  {
    id: '5',
    order_number: 'DP200820002',
    customer: 'Siti Rahayu',
    amount: 700000,
    type: 'dp',
    method: 'QRIS',
    status: 'pending',
    date: '2026-08-20T11:00:00Z',
  },
]

const outstandingPayments = [
  {
    id: '1',
    order_number: 'DP200820001',
    customer: 'Budi Santoso',
    remaining: 375000,
    due_date: '2026-08-22',
  },
  {
    id: '2',
    order_number: 'DP200820004',
    customer: 'Dewi Lestari',
    remaining: 1250000,
    due_date: '2026-08-23',
  },
]

export default function FinancePage() {
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = revenueData.reduce((sum, d) => sum + d.orders, 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Keuangan</h1>
        <p className="text-muted-foreground">
          Laporan pendapatan dan pembayaran
        </p>
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
                <p className="text-sm text-muted-foreground">Pendapatan 7 Hari</p>
                <p className="text-xl font-bold">{formatIDR(totalRevenue)}</p>
                <div className="flex items-center gap-1 text-xs text-success">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+12% dari minggu lalu</span>
                </div>
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
                <p className="text-xl font-bold">{totalOrders}</p>
                <p className="text-xs text-muted-foreground">7 hari terakhir</p>
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
                <p className="text-xl font-bold">{formatIDR(avgOrderValue)}</p>
                <p className="text-xs text-muted-foreground">Per order</p>
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
                <p className="text-xl font-bold">
                  {formatIDR(outstandingPayments.reduce((sum, p) => sum + p.remaining, 0))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {outstandingPayments.length} pesanan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Pendapatan 7 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-2">
            {revenueData.map((day, index) => {
              const maxRevenue = Math.max(...revenueData.map((d) => d.revenue))
              const height = (day.revenue / maxRevenue) * 100

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full relative">
                    <div
                      className="w-full bg-primary/80 rounded-t-lg transition-all hover:bg-primary"
                      style={{ height: `${height * 2}px` }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium">
                      {formatIDR(day.revenue)}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {day.date}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Pembayaran Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{payment.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.customer}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={payment.type === 'dp' ? 'info' : 'success'}
                        className="text-xs"
                      >
                        {payment.type === 'dp' ? 'DP' : 'Pelunasan'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {payment.method}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-success">
                      +{formatIDR(payment.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateShort(payment.date)}
                    </p>
                    <Badge
                      variant={payment.status === 'confirmed' ? 'success' : 'warning'}
                      className="mt-1"
                    >
                      {payment.status === 'confirmed' ? 'Dikonfirmasi' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              {outstandingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border border-warning/20 bg-warning/5 p-3"
                >
                  <div>
                    <p className="font-medium">{payment.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.customer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-warning">
                      {formatIDR(payment.remaining)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Jatuh tempo: {formatDateShort(payment.due_date)}
                    </p>
                  </div>
                </div>
              ))}

              {outstandingPayments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Tidak ada pembayaran tertunggak</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
