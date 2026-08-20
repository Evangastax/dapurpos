'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  UtensilsCrossed,
  Drumstick,
  Cookie,
} from 'lucide-react'
import { formatIDR } from '@/lib/utils'

// Mock data - replace with Supabase later
const mockRice = [
  { id: '1', name: 'Nasi Putih', price: 5000, stock_qty: 100, is_active: true },
  { id: '2', name: 'Nasi Kuning', price: 7000, stock_qty: 80, is_active: true },
  { id: '3', name: 'Nasi Uduk', price: 6000, stock_qty: 50, is_active: true },
]

const mockProtein = [
  { id: '1', name: 'Ayam Goreng', price: 12000, stock_qty: 60, is_active: true },
  { id: '2', name: 'Ayam Laos', price: 13000, stock_qty: 45, is_active: true },
  { id: '3', name: 'Rendang Sapi', price: 18000, stock_qty: 30, is_active: true },
  { id: '4', name: 'Ikan Bakar', price: 15000, stock_qty: 25, is_active: true },
  { id: '5', name: 'Telur Balado', price: 8000, stock_qty: 50, is_active: true },
]

const mockAddons = [
  { id: '1', name: 'Telur Dadar', price: 5000, stock_qty: 70, is_active: true },
  { id: '2', name: 'Orek Tempe', price: 4000, stock_qty: 60, is_active: true },
  { id: '3', name: 'Sambal', price: 2000, stock_qty: 100, is_active: true },
  { id: '4', name: 'Kerupuk', price: 2000, stock_qty: 100, is_active: true },
  { id: '5', name: 'Lalapan', price: 3000, stock_qty: 50, is_active: true },
]

type MenuTab = 'rice' | 'protein' | 'addons'

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState<MenuTab>('rice')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { id: 'rice' as MenuTab, label: 'Nasi', labelId: 'Nasi', icon: UtensilsCrossed, data: mockRice },
    { id: 'protein' as MenuTab, label: 'Protein', labelId: 'Protein', icon: Drumstick, data: mockProtein },
    { id: 'addons' as MenuTab, label: 'Lauk', labelId: 'Lauk Pelengkap', icon: Cookie, data: mockAddons },
  ]

  const currentTab = tabs.find((t) => t.id === activeTab)!
  const filteredData = currentTab.data.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">
            Kelola menu nasi, protein, dan lauk pelengkap
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Menu
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.labelId}
            <Badge variant="secondary" className="ml-1">
              {tab.data.length}
            </Badge>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={`Cari ${currentTab.labelId.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Menu Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredData.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge variant={item.is_active ? 'success' : 'secondary'}>
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-lg font-bold text-primary">
                    {formatIDR(item.price)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Stok: {item.stock_qty} porsi
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>

              {/* Stock bar */}
              <div className="mt-3">
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className={`h-1.5 rounded-full ${
                      item.stock_qty < 20
                        ? 'bg-warning'
                        : item.stock_qty < 50
                        ? 'bg-info'
                        : 'bg-success'
                    }`}
                    style={{
                      width: `${Math.min((item.stock_qty / 100) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add new card */}
        <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">Tambah {currentTab.labelId}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Klik untuk menambah menu baru
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
