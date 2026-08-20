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
  Users,
  Phone,
  Mail,
  MapPin,
  Package,
} from 'lucide-react'

// Mock data
const mockSuppliers = [
  {
    id: '1',
    name: 'Beras Jaya',
    contact: '0812-3456-7890',
    email: 'berasjaya@email.com',
    address: 'Jl. Pasar Pagi No. 15, Jakarta',
    ingredients: ['Beras Putih', 'Beras Kuning'],
    notes: 'Pengiriman setiap Senin & Kamis',
  },
  {
    id: '2',
    name: 'PT Ayam Segar',
    contact: '0813-4567-8901',
    email: 'ayamsegar@email.com',
    address: 'Jl. Raya Bogor Km 20, Jakarta',
    ingredients: ['Ayam', 'Ayam Fillet'],
    notes: 'Ayam potong segar setiap hari',
  },
  {
    id: '3',
    name: 'Telur Fresh',
    contact: '0815-6789-0123',
    email: 'telurfresh@email.com',
    address: 'Jl. Industri No. 8, Tangerang',
    ingredients: ['Telur Ayam', 'Telur Puyuh'],
    notes: 'Telur grade A',
  },
  {
    id: '4',
    name: 'Bumbu Nusantara',
    contact: '0816-7890-1234',
    email: 'bumbunusantara@email.com',
    address: 'Jl. Kramat No. 22, Jakarta',
    ingredients: ['Cabai', 'Bawang', 'Sambal', 'Bumbu Racik'],
    notes: 'Harga bisa nego untuk pembelian banyak',
  },
  {
    id: '5',
    name: 'Tempe Nusantara',
    contact: '0817-8901-2345',
    email: 'tempenusantara@email.com',
    address: 'Jl. Kebon Jeruk No. 11, Jakarta',
    ingredients: ['Tempe', 'Tahu'],
    notes: 'Produksi sendiri, tanpa pengawet',
  },
  {
    id: '6',
    name: 'Sembako Jaya',
    contact: '0818-9012-3456',
    email: 'sembakojaya@email.com',
    address: 'Jl. Mangga Besar No. 33, Jakarta',
    ingredients: ['Minyak Goreng', 'Gula', 'Garam', 'Tepung'],
    notes: 'Grosir & eceran',
  },
]

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSuppliers = mockSuppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.ingredients.some((ing) =>
        ing.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supplier</h1>
          <p className="text-muted-foreground">
            Kelola data supplier bahan baku
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Supplier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Supplier</p>
                <p className="text-xl font-bold">{mockSuppliers.length}</p>
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
                <p className="text-sm text-muted-foreground">Total Bahan</p>
                <p className="text-xl font-bold">
                  {mockSuppliers.reduce((sum, s) => sum + s.ingredients.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Phone className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kontak Tersedia</p>
                <p className="text-xl font-bold">{mockSuppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari supplier atau bahan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Supplier Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{supplier.name}</h3>
                  {supplier.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {supplier.notes}
                    </p>
                  )}
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

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.contact}</span>
                </div>
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.email}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.address}</span>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              <div>
                <p className="text-sm font-medium mb-2">Bahan yang disuplai:</p>
                <div className="flex flex-wrap gap-1.5">
                  {supplier.ingredients.map((ingredient) => (
                    <Badge key={ingredient} variant="secondary">
                      {ingredient}
                    </Badge>
                  ))}
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
            <p className="font-medium">Tambah Supplier</p>
            <p className="text-sm text-muted-foreground mt-1">
              Klik untuk menambah supplier baru
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
