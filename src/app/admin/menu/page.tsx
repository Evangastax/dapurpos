'use client'

import { useState, useEffect } from 'react'
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
  X,
  Save,
  Loader2,
} from 'lucide-react'
import { formatIDR } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/types'

type MenuTab = 'rice' | 'protein' | 'addons'

interface FormData {
  name: string
  description: string
  price: string
  stock_qty: string
  unit: string
}

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState<MenuTab>('rice')
  const [searchQuery, setSearchQuery] = useState('')
  const [riceItems, setRiceItems] = useState<MenuItem[]>([])
  const [proteinItems, setProteinItems] = useState<MenuItem[]>([])
  const [addonItems, setAddonItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    stock_qty: '',
    unit: 'porsi',
  })

  const tableName = {
    rice: 'menu_rice',
    protein: 'menu_protein',
    addons: 'menu_addons',
  }[activeTab]

  const tabs = [
    { id: 'rice' as MenuTab, label: 'Nasi', icon: UtensilsCrossed, data: riceItems },
    { id: 'protein' as MenuTab, label: 'Protein', icon: Drumstick, data: proteinItems },
    { id: 'addons' as MenuTab, label: 'Lauk', icon: Cookie, data: addonItems },
  ]

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [rice, protein, addons] = await Promise.all([
        supabase.from('menu_rice').select('*').order('name'),
        supabase.from('menu_protein').select('*').order('name'),
        supabase.from('menu_addons').select('*').order('name'),
      ])

      if (rice.data) setRiceItems(rice.data)
      if (protein.data) setProteinItems(protein.data)
      if (addons.data) setAddonItems(addons.data)
    } catch (err) {
      console.error('Error fetching menu:', err)
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditingItem(null)
    setFormData({ name: '', description: '', price: '', stock_qty: '', unit: 'porsi' })
    setShowModal(true)
  }

  function openEdit(item: MenuItem) {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      stock_qty: item.stock_qty.toString(),
      unit: item.unit || 'porsi',
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!formData.name || !formData.price) {
      alert('Nama dan harga harus diisi')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_qty: parseFloat(formData.stock_qty) || 0,
        unit: formData.unit,
        is_active: true,
      }

      if (editingItem) {
        // Update
        const { error } = await supabase
          .from(tableName)
          .update(payload)
          .eq('id', editingItem.id)

        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase
          .from(tableName)
          .insert(payload)

        if (error) throw error
      }

      setShowModal(false)
      await fetchAll()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: MenuItem) {
    if (!confirm(`Hapus ${item.name}?`)) return

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', item.id)

      if (error) throw error
      await fetchAll()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  async function toggleActive(item: MenuItem) {
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ is_active: !item.is_active })
        .eq('id', item.id)

      if (error) throw error
      await fetchAll()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const currentTab = tabs.find((t) => t.id === activeTab)!
  const filteredData = currentTab.data.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">
            Kelola menu nasi, protein, dan lauk pelengkap
          </p>
        </div>
        <Button onClick={openAdd}>
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
            {tab.label}
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
          placeholder={`Cari ${currentTab.label.toLowerCase()}...`}
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
                    <Badge
                      variant={item.is_active ? 'success' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleActive(item)}
                    >
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-lg font-bold text-primary">
                    {formatIDR(item.price)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Stok: {item.stock_qty} {item.unit || 'porsi'}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                    onClick={() => openEdit(item)}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors"
                    onClick={() => handleDelete(item)}
                  >
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
        <Card
          className="border-dashed hover:border-primary/50 transition-colors cursor-pointer"
          onClick={openAdd}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">Tambah {currentTab.label}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Klik untuk menambah menu baru
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>
                {editingItem ? 'Edit Menu' : 'Tambah Menu'}
              </CardTitle>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nama Menu *"
                placeholder="Nama menu"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label="Deskripsi"
                placeholder="Deskripsi singkat"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <Input
                label="Harga (Rp) *"
                type="number"
                placeholder="10000"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
              <Input
                label="Stok"
                type="number"
                placeholder="0"
                value={formData.stock_qty}
                onChange={(e) =>
                  setFormData({ ...formData, stock_qty: e.target.value })
                }
              />
              <Input
                label="Satuan"
                placeholder="porsi"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  loading={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
