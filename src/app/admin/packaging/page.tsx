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
  Package,
  X,
  Save,
  Loader2,
} from 'lucide-react'
import { formatIDR } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface PackagingOption {
  id: string
  name: string
  description: string | null
  price: number
  is_active: boolean
  created_at: string
}

interface FormData {
  name: string
  description: string
  price: string
}

export default function PackagingPage() {
  const [items, setItems] = useState<PackagingOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<PackagingOption | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
  })

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('packaging_options')
        .select('*')
        .order('name')

      if (error) throw error
      if (data) setItems(data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditingItem(null)
    setFormData({ name: '', description: '', price: '' })
    setShowModal(true)
  }

  function openEdit(item: PackagingOption) {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
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
        description: formData.description || null,
        price: parseFloat(formData.price),
        is_active: true,
      }

      if (editingItem) {
        const { error } = await supabase
          .from('packaging_options')
          .update(payload)
          .eq('id', editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('packaging_options')
          .insert(payload)
        if (error) throw error
      }

      setShowModal(false)
      await fetchItems()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: PackagingOption) {
    if (!confirm(`Hapus ${item.name}?`)) return

    try {
      const { error } = await supabase
        .from('packaging_options')
        .delete()
        .eq('id', item.id)
      if (error) throw error
      await fetchItems()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  async function toggleActive(item: PackagingOption) {
    try {
      const { error } = await supabase
        .from('packaging_options')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)
      if (error) throw error
      await fetchItems()
    } catch (err: any) {
      alert('Error: ' + err.message)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kemasan & Wadah</h1>
          <p className="text-muted-foreground">Kelola pilihan kemasan untuk pesanan</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kemasan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Kemasan</p>
                <p className="text-xl font-bold">{items.length}</p>
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
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-xl font-bold">{items.filter(i => i.is_active).length}</p>
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
                <p className="text-sm text-muted-foreground">Harga Rata-rata</p>
                <p className="text-xl font-bold">
                  {items.length > 0 ? formatIDR(items.reduce((sum, i) => sum + i.price, 0) / items.length) : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge
                      variant={item.is_active ? 'success' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleActive(item)}
                    >
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-lg font-bold text-primary">{formatIDR(item.price)}/pack</p>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
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
            </CardContent>
          </Card>
        ))}

        {/* Add card */}
        <Card
          className="border-dashed hover:border-primary/50 transition-colors cursor-pointer"
          onClick={openAdd}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">Tambah Kemasan</p>
            <p className="text-sm text-muted-foreground mt-1">
              Klik untuk menambah kemasan baru
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{editingItem ? 'Edit Kemasan' : 'Tambah Kemasan'}</CardTitle>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nama Kemasan *"
                placeholder="Thinwall, Box Mika, dll"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Deskripsi"
                placeholder="Deskripsi singkat"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                label="Harga per Pack (Rp) *"
                type="number"
                placeholder="2000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Batal
                </Button>
                <Button className="flex-1" onClick={handleSave} loading={saving}>
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
