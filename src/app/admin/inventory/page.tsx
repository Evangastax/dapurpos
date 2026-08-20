'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit2,
  Search,
  AlertTriangle,
  Package,
  ArrowUpDown,
} from 'lucide-react'
import { formatIDR } from '@/lib/utils'

// Mock data
const mockIngredients = [
  {
    id: '1',
    name: 'Beras Putih',
    unit: 'kg',
    stock_qty: 25,
    min_stock_alert: 10,
    cost_per_unit: 15000,
    supplier: 'Beras Jaya',
  },
  {
    id: '2',
    name: 'Ayam',
    unit: 'kg',
    stock_qty: 15,
    min_stock_alert: 20,
    cost_per_unit: 45000,
    supplier: 'PT Ayam Segar',
  },
  {
    id: '3',
    name: 'Telur',
    unit: 'butir',
    stock_qty: 200,
    min_stock_alert: 50,
    cost_per_unit: 2500,
    supplier: 'Telur Fresh',
  },
  {
    id: '4',
    name: 'Tempe',
    unit: 'papan',
    stock_qty: 30,
    min_stock_alert: 10,
    cost_per_unit: 5000,
    supplier: 'Tempe Nusantara',
  },
  {
    id: '5',
    name: 'Cabai',
    unit: 'kg',
    stock_qty: 5,
    min_stock_alert: 3,
    cost_per_unit: 35000,
    supplier: 'Bumbu Nusantara',
  },
  {
    id: '6',
    name: 'Minyak Goreng',
    unit: 'liter',
    stock_qty: 20,
    min_stock_alert: 5,
    cost_per_unit: 18000,
    supplier: 'Sembako Jaya',
  },
  {
    id: '7',
    name: 'Kerupuk',
    unit: 'pack',
    stock_qty: 50,
    min_stock_alert: 15,
    cost_per_unit: 8000,
    supplier: 'Snack Indo',
  },
  {
    id: '8',
    name: 'Sambal',
    unit: 'pack',
    stock_qty: 5,
    min_stock_alert: 10,
    cost_per_unit: 12000,
    supplier: 'Bumbu Nusantara',
  },
]

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredIngredients = mockIngredients.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lowStockItems = mockIngredients.filter(
    (item) => item.stock_qty <= item.min_stock_alert
  )

  const getStockStatus = (current: number, min: number) => {
    if (current <= min) return { label: 'Rendah', variant: 'destructive' as const }
    if (current <= min * 1.5) return { label: 'Habis', variant: 'warning' as const }
    return { label: 'Aman', variant: 'success' as const }
  }

  const getStockPercentage = (current: number, min: number) => {
    const max = min * 5 // Assume max is 5x min
    return Math.min(Math.round((current / max) * 100), 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">
            Kelola stok bahan baku
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Riwayat Stok
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Bahan
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Stok Rendah ({lowStockItems.length} item)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((item) => (
                <Badge key={item.id} variant="warning" className="text-sm">
                  {item.name}: {item.stock_qty} {item.unit}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Item</p>
                <p className="text-xl font-bold">{mockIngredients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Package className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stok Aman</p>
                <p className="text-xl font-bold">
                  {mockIngredients.filter((i) => i.stock_qty > i.min_stock_alert).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stok Rendah</p>
                <p className="text-xl font-bold">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Package className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Nilai Stok</p>
                <p className="text-xl font-bold">
                  {formatIDR(
                    mockIngredients.reduce(
                      (sum, item) => sum + item.stock_qty * item.cost_per_unit,
                      0
                    )
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari bahan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Nama Bahan
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Stok
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Min. Stok
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Harga/Unit
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Supplier
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map((item) => {
                  const status = getStockStatus(item.stock_qty, item.min_stock_alert)
                  const percentage = getStockPercentage(item.stock_qty, item.min_stock_alert)

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">
                          {item.stock_qty} {item.unit}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {item.min_stock_alert} {item.unit}
                      </td>
                      <td className="p-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="p-4">{formatIDR(item.cost_per_unit)}</td>
                      <td className="p-4 text-muted-foreground">
                        {item.supplier}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button className="rounded-lg p-1.5 hover:bg-primary/10 transition-colors">
                            <Plus className="h-4 w-4 text-primary" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
