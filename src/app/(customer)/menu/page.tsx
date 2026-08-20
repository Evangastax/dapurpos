'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  UtensilsCrossed,
  Drumstick,
  Cookie,
  Cake,
  ShoppingCart,
  Minus,
  Plus,
  Search,
  Loader2,
} from 'lucide-react'
import { formatIDR } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/types'

type MenuType = 'maincourse' | 'dessert'
type MainStep = 'rice' | 'protein' | 'addons' | 'quantity'

export default function MenuPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [menuType, setMenuType] = useState<MenuType>('maincourse')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Main Course state
  const [step, setStep] = useState<MainStep>('rice')
  const [riceOptions, setRiceOptions] = useState<MenuItem[]>([])
  const [proteinOptions, setProteinOptions] = useState<MenuItem[]>([])
  const [addonOptions, setAddonOptions] = useState<MenuItem[]>([])
  const [selectedRice, setSelectedRice] = useState<MenuItem | null>(null)
  const [selectedProteins, setSelectedProteins] = useState<MenuItem[]>([])
  const [selectedAddons, setSelectedAddons] = useState<MenuItem[]>([])
  const [quantity, setQuantity] = useState(10)
  
  // Dessert state
  const [dessertOptions, setDessertOptions] = useState<MenuItem[]>([])
  const [selectedDessert, setSelectedDessert] = useState<MenuItem | null>(null)
  const [dessertQty, setDessertQty] = useState(10)
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenu()
  }, [])

  async function fetchMenu() {
    setLoading(true)
    try {
      const [rice, protein, addons, dessert] = await Promise.all([
        supabase.from('menu_rice').select('*').eq('is_active', true).order('name'),
        supabase.from('menu_protein').select('*').eq('is_active', true).order('name'),
        supabase.from('menu_addons').select('*').eq('is_active', true).order('name'),
        supabase.from('menu_dessert').select('*').eq('is_active', true).order('name'),
      ])

      if (rice.data) setRiceOptions(rice.data)
      if (protein.data) setProteinOptions(protein.data)
      if (addons.data) setAddonOptions(addons.data)
      if (dessert.data) setDessertOptions(dessert.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter by search
  const filteredRice = riceOptions.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredProtein = proteinOptions.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredAddons = addonOptions.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredDessert = dessertOptions.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const mainSteps: { id: MainStep; label: string; icon: any }[] = [
    { id: 'rice', label: 'Nasi', icon: UtensilsCrossed },
    { id: 'protein', label: 'Protein', icon: Drumstick },
    { id: 'addons', label: 'Lauk', icon: Cookie },
    { id: 'quantity', label: 'Jumlah', icon: ShoppingCart },
  ]

  const currentStepIndex = mainSteps.findIndex(s => s.id === step)

  const comboPrice =
    (selectedRice?.price || 0) +
    selectedProteins.reduce((sum, p) => sum + p.price, 0) +
    selectedAddons.reduce((sum, a) => sum + a.price, 0)

  const subtotal = comboPrice * quantity

  function toggleProtein(protein: MenuItem) {
    setSelectedProteins(prev =>
      prev.find(p => p.id === protein.id)
        ? prev.filter(p => p.id !== protein.id)
        : [...prev, protein]
    )
  }

  function toggleAddon(addon: MenuItem) {
    setSelectedAddons(prev =>
      prev.find(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    )
  }

  function canProceed() {
    if (menuType === 'dessert') {
      return selectedDessert !== null && dessertQty >= 10
    }
    switch (step) {
      case 'rice': return selectedRice !== null
      case 'protein': return selectedProteins.length > 0
      case 'addons': return true
      case 'quantity': return quantity >= 10
      default: return true
    }
  }

  function handleNext() {
    if (menuType === 'dessert') {
      // Save dessert combo to localStorage
      const comboData = {
        type: 'dessert',
        dessert: selectedDessert,
        quantity: dessertQty,
        comboPrice: selectedDessert?.price || 0,
        subtotal: (selectedDessert?.price || 0) * dessertQty,
      }
      localStorage.setItem('dapurpos_combo', JSON.stringify(comboData))
      router.push('/checkout')
      return
    }

    if (step === 'quantity') {
      const comboData = {
        type: 'maincourse',
        rice: selectedRice,
        proteins: selectedProteins,
        addons: selectedAddons,
        quantity,
        comboPrice,
        subtotal,
      }
      localStorage.setItem('dapurpos_combo', JSON.stringify(comboData))
      router.push('/checkout')
      return
    }

    const nextIndex = currentStepIndex + 1
    if (nextIndex < mainSteps.length) {
      setStep(mainSteps[nextIndex].id)
    }
  }

  function handleBack() {
    if (menuType === 'maincourse') {
      const prevIndex = currentStepIndex - 1
      if (prevIndex >= 0) {
        setStep(mainSteps[prevIndex].id)
      }
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-heading text-3xl font-bold mb-2">Pesan Sekarang</h1>
          <p className="text-muted-foreground">Pilih menu favorit Anda</p>
          {!user && (
            <p className="text-sm text-warning mt-2">
              Silakan login terlebih dahulu untuk memesan
            </p>
          )}
        </div>

        {/* Menu Type Tabs */}
        <div className="flex rounded-lg bg-muted p-1 mb-6">
          <button
            onClick={() => { setMenuType('maincourse'); setSearchQuery('') }}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              menuType === 'maincourse'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <UtensilsCrossed className="inline-block mr-2 h-4 w-4" />
            Main Course
          </button>
          <button
            onClick={() => { setMenuType('dessert'); setSearchQuery('') }}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              menuType === 'dessert'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <Cake className="inline-block mr-2 h-4 w-4" />
            Dessert & Kue
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={menuType === 'maincourse' ? 'Cari nasi, protein, lauk...' : 'Cari kue, dessert...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Main Course */}
        {menuType === 'maincourse' && (
          <>
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-6">
              {mainSteps.map((s, index) => (
                <div key={s.id} className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      index < currentStepIndex
                        ? 'bg-success border-success text-white'
                        : index === currentStepIndex
                        ? 'bg-primary border-primary text-on-primary'
                        : 'bg-background border-border text-muted-foreground'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <s.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${index === currentStepIndex ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {step === 'rice' && 'Pilih Nasi'}
                  {step === 'protein' && 'Pilih Protein'}
                  {step === 'addons' && 'Pilih Lauk Pelengkap'}
                  {step === 'quantity' && 'Tentukan Jumlah'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Rice */}
                {step === 'rice' && (
                  <div className="space-y-3">
                    {filteredRice.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Tidak ada nasi ditemukan</p>
                    ) : (
                      filteredRice.map(rice => (
                        <div
                          key={rice.id}
                          onClick={() => setSelectedRice(rice)}
                          className={`flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                            selectedRice?.id === rice.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div>
                            <p className="font-medium">{rice.name}</p>
                            {rice.description && <p className="text-sm text-muted-foreground">{rice.description}</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-primary">{formatIDR(rice.price)}</span>
                            {selectedRice?.id === rice.id && (
                              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-4 w-4 text-on-primary" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Protein */}
                {step === 'protein' && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-2">Pilih satu atau lebih protein</p>
                    {filteredProtein.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Tidak ada protein ditemukan</p>
                    ) : (
                      filteredProtein.map(protein => {
                        const isSelected = selectedProteins.find(p => p.id === protein.id)
                        return (
                          <div
                            key={protein.id}
                            onClick={() => toggleProtein(protein)}
                            className={`flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                              isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div>
                              <p className="font-medium">{protein.name}</p>
                              {protein.description && <p className="text-sm text-muted-foreground">{protein.description}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-primary">+{formatIDR(protein.price)}</span>
                              {isSelected && (
                                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="h-4 w-4 text-on-primary" />
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {/* Addons */}
                {step === 'addons' && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-2">Pilih lauk pelengkap (opsional)</p>
                    {filteredAddons.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Tidak ada lauk ditemukan</p>
                    ) : (
                      filteredAddons.map(addon => {
                        const isSelected = selectedAddons.find(a => a.id === addon.id)
                        return (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddon(addon)}
                            className={`flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                              isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div>
                              <p className="font-medium">{addon.name}</p>
                              {addon.description && <p className="text-sm text-muted-foreground">{addon.description}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-primary">+{formatIDR(addon.price)}</span>
                              {isSelected && (
                                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="h-4 w-4 text-on-primary" />
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {/* Quantity */}
                {step === 'quantity' && (
                  <div className="space-y-6">
                    <div className="rounded-lg bg-muted p-4">
                      <h3 className="font-medium mb-3">Combo Anda</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nasi</span>
                          <span>{selectedRice?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Protein</span>
                          <span>{selectedProteins.map(p => p.name).join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lauk</span>
                          <span>{selectedAddons.length > 0 ? selectedAddons.map(a => a.name).join(', ') : '-'}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t border-border">
                          <span>Harga/pack</span>
                          <span className="text-primary">{formatIDR(comboPrice)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">Berapa pack yang ingin dipesan?</p>
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => setQuantity(Math.max(10, quantity - 5))}
                          className="h-12 w-12 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <div className="w-32">
                          <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(10, parseInt(e.target.value) || 10))}
                            min={10}
                            className="text-center text-xl font-bold"
                          />
                        </div>
                        <button
                          onClick={() => setQuantity(quantity + 5)}
                          className="h-12 w-12 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Minimum 10 pack</p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {[10, 15, 20, 25, 30, 50, 100].map(qty => (
                        <button
                          key={qty}
                          onClick={() => setQuantity(qty)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            quantity === qty ? 'bg-primary text-on-primary' : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {qty} pack
                        </button>
                      ))}
                    </div>

                    {quantity > 25 && (
                      <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm">
                        <p className="font-medium text-warning">Perhatian: Pesanan {quantity} pack</p>
                        <p className="text-muted-foreground">
                          Pemesanan minimal H-{quantity > 50 ? '5' : '2'} sebelum tanggal pengiriman
                        </p>
                      </div>
                    )}

                    <div className="rounded-lg bg-primary/5 p-4 text-center">
                      <p className="text-sm text-muted-foreground">Total Harga</p>
                      <p className="text-2xl font-bold text-primary">{formatIDR(subtotal)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Dessert */}
        {menuType === 'dessert' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pilih Kue / Dessert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredDessert.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Tidak ada kue ditemukan</p>
                ) : (
                  filteredDessert.map(dessert => {
                    const isSelected = selectedDessert?.id === dessert.id
                    return (
                      <div
                        key={dessert.id}
                        onClick={() => setSelectedDessert(dessert)}
                        className={`flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{dessert.name}</p>
                          {dessert.description && <p className="text-sm text-muted-foreground">{dessert.description}</p>}
                          <p className="text-xs text-muted-foreground mt-1">Stok: {dessert.stock_qty} {dessert.unit}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-primary">{formatIDR(dessert.price)}</span>
                          {isSelected && (
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-4 w-4 text-on-primary" />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Quantity for dessert */}
              {selectedDessert && (
                <div className="mt-6 space-y-4">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Berapa pack?</p>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => setDessertQty(Math.max(10, dessertQty - 5))}
                        className="h-12 w-12 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <div className="w-32">
                        <Input
                          type="number"
                          value={dessertQty}
                          onChange={(e) => setDessertQty(Math.max(10, parseInt(e.target.value) || 10))}
                          min={10}
                          className="text-center text-xl font-bold"
                        />
                      </div>
                      <button
                        onClick={() => setDessertQty(dessertQty + 5)}
                        className="h-12 w-12 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Minimum 10 pack</p>
                  </div>

                  <div className="rounded-lg bg-primary/5 p-4 text-center">
                    <p className="text-sm text-muted-foreground">Total Harga</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatIDR(selectedDessert.price * dessertQty)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={menuType === 'dessert' || currentStepIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button onClick={handleNext} disabled={!canProceed() || !user}>
            Ke Checkout
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {!user && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            <a href="/login" className="text-primary hover:underline">Login</a> atau{' '}
            <a href="/register" className="text-primary hover:underline">Daftar</a> untuk mulai memesan
          </p>
        )}
      </div>
    </div>
  )
}
