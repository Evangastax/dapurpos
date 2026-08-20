'use client'

import { useState, useEffect } from 'react'
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
  X,
  Save,
  Loader2,
} from 'lucide-react'
import { formatIDR } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Ingredient, Supplier } from '@/types'

interface FormData {
  name: string
  unit: string
  stock_qty: string
  min_stock_alert: string
  cost_per_unit: string
  supplier_id: string
}

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    unit: '',
    stock_qty: '',
    min_stock_alert: '',
    cost_per_unit: '',
    supplier_id: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [ingredientsRes, suppliersRes] = await Promise.all([
        supabase.from('ingredients').select('*').order('name'),
        supabase.from('suppliers').select('*').order('name'),
      ])

      if (ingredientsRes.data) setIngredients(ingredientsRes.data)
      if (suppliersRes.data) setSuppliers(suppliersRes.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditingItem(null)
    setFormData({
      name: '',
      unit: '',
      stock_qty: '',
      min_stock_alert: '',
      cost_per_unit: '',
      supplier_id: '',
    })
    setShowModal(true)
  }

  function openEdit(item: Ingredient) {
    setEditingItem(item)
    setFormData({
      name: item.name,
      unit: item.unit,
      stock_qty: item.stock_qty.toString(),
      min_stock_alert: item.min_stock_alert?.toString() || '',
      cost_per_unit: item.cost_per_unit?.toString() || '',
      supplier_id: item.supplier_id || '',
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!formData.name || !formData.unit) {
      alert('Nama dan satuan harus diisi')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        unit: formData.unit,
        stock_qty: parseFloat(formData.stock_qty) || 0,
        min_stock_alert: parseFloat(formData.min_stock_alert) || null,
        cost_per_unit: parseFloat(formData.cost_per_unit) || null,
        supplier_id: formData.supplier_id || null,
      }

      if (editingItem) {
        const { error } = await supabase
          .from('ingredients')
          .update(payload)
          .eq('id', editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('ingredients')
          .insert(payload)
        if (error) throw error
      }

      setShowModal(false)
      await fetchData()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Ingredient) {
    if (!confirm(`Hapus ${item.name}?`)) return

    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', item.id)
      if (error) throw error
      await fetchData()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  async function updateStock(item: Ingredient, change: number) {
    try {
      const { error } = await supabase
        .from('ingredients')
        .update({ stock_qty: item.stock_qty + change })
        .eq('id', item.id)
      if (error) throw error
      await fetchData()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const filteredIngredients = ingredients.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lowStockItems = ingredients.filter(
    (item) => item.min_stock_alert && item.stock_qty <= item.min_stock_alert
  )

  const getStockStatus = (current: number, min?: number | null) => {
    if (!min) return { label: 'Aman', variant: 'success' as const }
    if (current <= min) return { label: 'Rendah', variant: 'destructive' as const }
    if (current <= min * 1.5) return { label: 'Hampir Habis', variant: 'warning' as const }
    return { label: 'Aman', variant: 'success' as const }
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
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Kelola stok bahan baku</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Bahan
        </Button>
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
                  <th className="text-left p-4 font-medium text-muted-foreground">Nama Bahan</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Stok</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Min. Stok</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Harga/Unit</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Supplier</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map((item) => {
                  const status = getStockStatus(item.stock_qty, item.min_stock_alert)
                  const supplier = suppliers.find((s) => s.id === item.supplier_id)

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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateStock(item, -1)}
                            className="h-6 w-6 rounded bg-muted flex items-center justify-center hover:bg-muted/80"
                          >
                            -
                          </button>
                          <span className="font-medium w-16 text-center">
                            {item.stock_qty} {item.unit}
                          </span>
                          <button
                            onClick={() => updateStock(item, 1)}
                            className="h-6 w-6 rounded bg-muted flex items-center justify-center hover:bg-muted/80"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {item.min_stock_alert || '-'} {item.unit}
                      </td>
                      <td className="p-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="p-4">
                        {item.cost_per_unit ? formatIDR(item.cost_per_unit) : '-'}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {supplier?.name || '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button
                            className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                            onClick={() => openEdit(item)}
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>
                {editingItem ? 'Edit Bahan' : 'Tambah Bahan'}
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
                label="Nama Bahan *"
                placeholder="Nama bahan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Satuan *"
                placeholder="kg, liter, pcs"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
              <Input
                label="Stok Saat Ini"
                type="number"
                placeholder="0"
                value={formData.stock_qty}
                onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
              />
              <Input
                label="Batas Stok Rendah"
                type="number"
                placeholder="20"
                value={formData.min_stock_alert}
                onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
                helperText="Peringatan jika stok di bawah angka ini"
              />
              <Input
                label="Harga per Unit (Rp)"
                type="number"
                placeholder="15000"
                value={formData.cost_per_unit}
                onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium mb-1.5">Supplier</label>
                <select
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                >
                  <option value="">Pilih Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
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
