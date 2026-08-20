import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingBag,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
} from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan aktivitas hari ini
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pesanan Hari Ini
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 dari kemarin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendapatan Hari Ini
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 2.450.000</div>
            <p className="text-xs text-muted-foreground">
              +15% dari kemarin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Menunggu DP
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Perlu konfirmasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stok Rendah
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Item perlu restock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pesanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Order 1 */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">DP200820001</p>
                  <p className="text-sm text-muted-foreground">
                    Budi Santoso - 30 pack
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">Rp 750.000</p>
                  <p className="text-sm text-muted-foreground">
                    21 Agu 2026, Siang
                  </p>
                </div>
                <Badge variant="success">DP Dikonfirmasi</Badge>
              </div>
            </div>

            {/* Order 2 */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">DP200820002</p>
                  <p className="text-sm text-muted-foreground">
                    Siti Rahayu - 50 pack
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">Rp 1.250.000</p>
                  <p className="text-sm text-muted-foreground">
                    25 Agu 2026, Pagi
                  </p>
                </div>
                <Badge variant="warning">Menunggu DP</Badge>
              </div>
            </div>

            {/* Order 3 */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">DP200820003</p>
                  <p className="text-sm text-muted-foreground">
                    Ahmad Hidayat - 20 pack
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">Rp 500.000</p>
                  <p className="text-sm text-muted-foreground">
                    22 Agu 2026, Sore
                  </p>
                </div>
                <Badge variant="info">Sedang Disiapkan</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Stok Rendah
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-warning/20 bg-warning/5 p-3">
              <div>
                <p className="font-medium">Ayam Goreng</p>
                <p className="text-sm text-muted-foreground">Supplier: PT Ayam Segar</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-warning">Sisa 15 porsi</p>
                <p className="text-xs text-muted-foreground">Min: 20 porsi</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-warning/20 bg-warning/5 p-3">
              <div>
                <p className="font-medium">Nasi Putih</p>
                <p className="text-sm text-muted-foreground">Supplier: Beras Jaya</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-warning">Sisa 8 kg</p>
                <p className="text-xs text-muted-foreground">Min: 10 kg</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-warning/20 bg-warning/5 p-3">
              <div>
                <p className="font-medium">Sambal</p>
                <p className="text-sm text-muted-foreground">Supplier: Bumbu Nusantara</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-warning">Sisa 5 pack</p>
                <p className="text-xs text-muted-foreground">Min: 10 pack</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-warning/20 bg-warning/5 p-3">
              <div>
                <p className="font-medium">Telur Dadar</p>
                <p className="text-sm text-muted-foreground">Supplier: Telur Fresh</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-warning">Sisa 12 porsi</p>
                <p className="text-xs text-muted-foreground">Min: 15 porsi</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
