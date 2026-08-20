import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DeliveryFeeResult, TimeSlot, TIME_SLOTS } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency to IDR
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date to Indonesian format
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

// Format date short
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

// Calculate delivery fee
export function calculateDeliveryFee(distanceKm: number): DeliveryFeeResult {
  const baseFee = 20000 // Rp 20.000
  const baseDistance = 3 // 3km included
  const extraRate = 50000 // Rp 50.000 per 5km

  if (distanceKm <= baseDistance) {
    return {
      base_fee: baseFee,
      extra_fee: 0,
      total_fee: baseFee,
      distance_km: distanceKm,
    }
  }

  const extraKm = distanceKm - baseDistance
  const extraBlocks = Math.ceil(extraKm / 5)

  return {
    base_fee: baseFee,
    extra_fee: extraBlocks * extraRate,
    total_fee: baseFee + extraBlocks * extraRate,
    distance_km: distanceKm,
  }
}

// Get minimum lead time based on order
export function getMinLeadTime(packQty: number, itemType?: string): number {
  if (itemType === 'kue_kering') return 15 // H-15
  if (itemType === 'snack') return 2 // H-2
  if (packQty > 50) return 5 // H-5
  if (packQty > 25) return 2 // H-2
  return 2 // default H-2
}

// Get cancel deadline
export function getCancelDeadline(deliveryDate: string, packQty: number): Date {
  const delivery = new Date(deliveryDate)
  const leadTime = getMinLeadTime(packQty)
  const deadline = new Date(delivery)
  deadline.setDate(deadline.getDate() - leadTime)
  return deadline
}

// Check if order can be cancelled
export function canCancelOrder(cancelDeadline: string): boolean {
  const now = new Date()
  const deadline = new Date(cancelDeadline)
  return now < deadline
}

// Generate order number
export function generateOrderNumber(): string {
  const date = new Date()
  const prefix = 'DP'
  const timestamp = date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}${timestamp}${random}`
}

// Calculate combo price
export function calculateComboPrice(
  ricePrice: number,
  proteinPrices: number[],
  addonPrices: number[]
): number {
  const proteinTotal = proteinPrices.reduce((sum, p) => sum + p, 0)
  const addonTotal = addonPrices.reduce((sum, a) => sum + a, 0)
  return ricePrice + proteinTotal + addonTotal
}

// Get time slot display
export function getTimeSlotDisplay(slot: TimeSlot, lang: 'en' | 'id' = 'id'): string {
  const slotInfo = TIME_SLOTS[slot]
  return `${lang === 'id' ? slotInfo.label_id : slotInfo.label} (${slotInfo.time})`
}

// Check if date is valid for order
export function isValidOrderDate(date: string, packQty: number): boolean {
  const orderDate = new Date(date)
  const now = new Date()
  const minLeadTime = getMinLeadTime(packQty)
  
  const minDate = new Date(now)
  minDate.setDate(minDate.getDate() + minLeadTime)
  
  return orderDate >= minDate
}

// Low stock check
export function isLowStock(currentQty: number, minAlert: number): boolean {
  return currentQty <= minAlert
}

// Calculate stock percentage
export function getStockPercentage(currentQty: number, maxQty: number): number {
  if (maxQty === 0) return 0
  return Math.round((currentQty / maxQty) * 100)
}
