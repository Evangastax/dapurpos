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
  Users,
  Phone,
  Mail,
  MapPin,
  X,
  Save,
  Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Supplier } from '@/types'

interface FormData {
  name: string
  contact: string
  email: string
  address: string
  notes: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Supplier | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contact: '',
    email: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  async function fetchSuppliers() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name')

      if (error) throw error
      if (data) setSuppliers(data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditingItem(null)
    setFormData({ name: '', contact: '', email: '', address: '', notes: '' })
    setShowModal(true)
  }

  function openEdit(item: Supplier) {
    setEditingItem(item)
    setFormData({
      name: item.name,
      contact: item.contact || '',
      email: item.email || '',
      address: item.address || '',
      notes: item.notes || '',
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!formData.name) {
      alert('Nama supplier harus diisi')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        contact: formData.contact || null,
        email: formData.email || null,
        address: formData.address || null,
        notes: formData.notes || null,
      }

      if (editingItem) {
        const { error } = await supabase
          .from('suppliers')
          .update(payload)
          .eq('id', editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert(payload)
        if (error) throw error
      }

      setShowModal(false)
      await fetchSuppliers()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Supplier) {
    if (!confirm(`Hapus supplier ${item.name}?`)) return

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', item.id)
      if (error) throw error
      await fetchSuppliers()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-bold">Supplier</h1>
          <p className="text-muted-foreground">Kelola data supplier bahan baku</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Supplier
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari supplier..."
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
                    <p className="text-sm text-muted-foreground mt-1">{supplier.notes}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                    onClick={() => openEdit(supplier)}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors"
                    onClick={() => handleDelete(supplier)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {supplier.contact && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.contact}</span>
                  </div>
                )}
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
            <p className="font-medium">Tambah Supplier</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{editingItem ? 'Edit Supplier' : 'Tambah Supplier'}</CardTitle>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nama Supplier *"
                placeholder="Nama supplier"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Kontak (WhatsApp)"
                placeholder="0812-3456-7890"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Alamat"
                placeholder="Alamat supplier"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Input
                label="Catatan"
                placeholder="Catatan tambahan"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
