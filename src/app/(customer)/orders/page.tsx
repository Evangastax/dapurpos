'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  Eye,
  XCircle,
} from 'lucide-react'
import { formatIDR, formatDateShort } from '@/lib/utils'
import Link from 'next/link'

// Mock data
const mockOrders = [
  {
    id: '1',
    order_number: 'DP200820001',
    rice_name: 'Nasi Putih',
    pack_qty: 30,
    grand_total: 750000,
    dp_amount: 375000,
    dp_paid_at: '2026-08-20T10:00:00Z',
    status: 'dp_confirmed',
    delivery_type: 'delivery',
    delivery_date: '2026-08-22',
    time_slot: 'siang',
    created_at: '2026-08-20T09:30:00Z',
  },
  {
    id: '2',
    order_number: 'DP200820005',
    rice_name: 'Nasi Putih',
    pack_qty: 15,
    grand_total: 345000,
    dp_amount: 172500,
    dp_paid_at: '2026-08-17T10:00:00Z',
    status: 'delivered',
    delivery_type: 'delivery',
    delivery_date: '2026-08-19',
    time_slot: 'siang',
    created_at: '2026-08-17T09:00:00Z',
  },
]

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
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-heading text-3xl font-bold mb-8">
          Pesanan Saya
        </h1>

        {mockOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">
                Belum ada pesanan
              </h2>
              <p className="text-muted-foreground mb-4">
                Mulai pesan nasi kotak untuk acara Anda
              </p>
              <Link href="/menu">
                <Button>Pesan Sekarang</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mockOrders.map((order) => {
              const config = statusConfig[order.status]
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
                        <span className="font-medium">
                          {formatIDR(order.grand_total)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Pengiriman
                        </span>
                        <span>
                          {order.delivery_type === 'delivery'
                            ? 'Delivery'
                            : 'Pickup'}{' '}
                          - {formatDateShort(order.delivery_date)},{' '}
                          {order.time_slot === 'pagi'
                            ? 'Pagi'
                            : order.time_slot === 'siang'
                            ? 'Siang'
                            : 'Sore'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/orders/${order.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Detail
                        </Button>
                      </Link>
                      {order.status === 'awaiting_dp' && (
                        <Button className="flex-1" size="sm">
                          Bayar DP
                        </Button>
                      )}
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
