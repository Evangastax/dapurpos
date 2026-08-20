'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Eye,
  Filter,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react'
import { formatIDR, formatDateShort } from '@/lib/utils'

// Mock data
const mockOrders = [
  {
    id: '1',
    order_number: 'DP200820001',
    customer_name: 'Budi Santoso',
    customer_phone: '0812-3456-7890',
    rice_name: 'Nasi Putih',
    pack_qty: 30,
    combo_price: 25000,
    grand_total: 750000,
    dp_amount: 375000,
    dp_paid_at: '2026-08-20T10:00:00Z',
    remaining_amount: 375000,
    status: 'dp_confirmed',
    delivery_type: 'delivery',
    delivery_date: '2026-08-22',
    time_slot: 'siang',
    created_at: '2026-08-20T09:30:00Z',
  },
  {
    id: '2',
    order_number: 'DP200820002',
    customer_name: 'Siti Rahayu',
    customer_phone: '0813-4567-8901',
    rice_name: 'Nasi Kuning',
    pack_qty: 50,
    combo_price: 28000,
    grand_total: 1400000,
    dp_amount: 700000,
    dp_paid_at: null,
    remaining_amount: 700000,
    status: 'awaiting_dp',
    delivery_type: 'delivery',
    delivery_date: '2026-08-25',
    time_slot: 'pagi',
    created_at: '2026-08-20T11:00:00Z',
  },
  {
    id: '3',
    order_number: 'DP200820003',
    customer_name: 'Ahmad Hidayat',
    customer_phone: '0815-6789-0123',
    rice_name: 'Nasi Uduk',
    pack_qty: 20,
    combo_price: 22000,
    grand_total: 440000,
    dp_amount: 220000,
    dp_paid_at: '2026-08-19T14:00:00Z',
    remaining_amount: 220000,
    status: 'preparing',
    delivery_type: 'pickup',
    delivery_date: '2026-08-21',
    time_slot: 'sore',
    created_at: '2026-08-19T13:00:00Z',
  },
  {
    id: '4',
    order_number: 'DP200820004',
    customer_name: 'Dewi Lestari',
    customer_phone: '0816-7890-1234',
    rice_name: 'Nasi Putih',
    pack_qty: 100,
    combo_price: 25000,
    grand_total: 2500000,
    dp_amount: 1250000,
    dp_paid_at: '2026-08-18T16:00:00Z',
    remaining_amount: 1250000,
    status: 'ready',
    delivery_type: 'delivery',
    delivery_date: '2026-08-23',
    time_slot: 'pagi',
    created_at: '2026-08-18T15:00:00Z',
  },
  {
    id: '5',
    order_number: 'DP200820005',
    customer_name: 'Rudi Hermawan',
    customer_phone: '0817-8901-2345',
    rice_name: 'Nasi Putih',
    pack_qty: 15,
    combo_price: 23000,
    grand_total: 345000,
    dp_amount: 172500,
    dp_paid_at: '2026-08-17T10:00:00Z',
    remaining_amount: 172500,
    status: 'delivered',
    delivery_type: 'delivery',
    delivery_date: '2026-08-19',
    time_slot: 'siang',
    created_at: '2026-08-17T09:00:00Z',
  },
  {
    id: '6',
    order_number: 'DP200820006',
    customer_name: 'Maya Putri',
    customer_phone: '0818-9012-3456',
    rice_name: 'Nasi Kuning',
    pack_qty: 25,
    combo_price: 27000,
    grand_total: 675000,
    dp_amount: 337500,
    dp_paid_at: null,
    remaining_amount: 337500,
    status: 'cancelled',
    delivery_type: 'pickup',
    delivery_date: '2026-08-20',
    time_slot: 'pagi',
    created_at: '2026-08-16T11:00:00Z',
  },
]

const statusFilters = [
  { id: 'all', label: 'Semua', count: mockOrders.length },
  { id: 'awaiting_dp', label: 'Menunggu DP', count: mockOrders.filter((o) => o.status === 'awaiting_dp').length },
  { id: 'dp_confirmed', label: 'DP Dikonfirmasi', count: mockOrders.filter((o) => o.status === 'dp_confirmed').length },
  { id: 'preparing', label: 'Disiapkan', count: mockOrders.filter((o) => o.status === 'preparing').length },
  { id: 'ready', label: 'Siap', count: mockOrders.filter((o) => o.status === 'ready').length },
  { id: 'delivered', label: 'Terkirim', count: mockOrders.filter((o) => o.status === 'delivered').length },
  { id: 'cancelled', label: 'Dibatalkan', count: mockOrders.filter((o) => o.status === 'cancelled').length },
]

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

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      activeFilter === 'all' || order.status === activeFilter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Pesanan</h1>
        <p className="text-muted-foreground">
          Kelola semua pesanan masuk
        </p>
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
                <p className="text-xl font-bold">{mockOrders.length}</p>
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
                <p className="text-xl font-bold">
                  {mockOrders.filter((o) => o.status === 'awaiting_dp').length}
                </p>
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
                <p className="text-xl font-bold">
                  {mockOrders.filter((o) => ['preparing', 'ready', 'out_for_delivery'].includes(o.status)).length}
                </p>
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
                <p className="text-xl font-bold">
                  {mockOrders.filter((o) => o.status === 'done').length}
                </p>
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
              activeFilter === filter.id
                ? 'bg-primary text-on-primary'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {filter.label}
            <Badge
              variant={activeFilter === filter.id ? 'secondary' : 'default'}
              className="ml-1"
            >
              {filter.count}
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
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    No. Pesanan
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Pelanggan
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Menu
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Pengiriman
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-medium">{order.order_number}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_phone}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{order.rice_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.pack_qty} pack
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">
                        {formatIDR(order.grand_total)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={statusConfig[order.status].variant}>
                        {statusConfig[order.status].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm">
                          {order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateShort(order.delivery_date)},{' '}
                          {order.time_slot === 'pagi'
                            ? 'Pagi'
                            : order.time_slot === 'siang'
                            ? 'Siang'
                            : 'Sore'}
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
