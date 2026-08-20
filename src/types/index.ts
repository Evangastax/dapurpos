export type UserRole = 'admin' | 'customer'

export type OrderStatus =
  | 'awaiting_dp'
  | 'dp_confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'picked_up'
  | 'delivered'
  | 'done'
  | 'cancelled'

export type DeliveryType = 'delivery' | 'pickup'

export type TimeSlot = 'pagi' | 'siang' | 'sore'

export type PaymentType = 'dp' | 'remaining'

export type InventoryReason = 'order' | 'manual' | 'restock' | 'adjustment'

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  role: UserRole
  address?: string
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  stock_qty: number
  unit: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  contact?: string
  email?: string
  address?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Ingredient {
  id: string
  name: string
  unit: string
  stock_qty: number
  min_stock_alert?: number
  supplier_id?: string
  cost_per_unit?: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  rice_id: string
  rice_name: string
  rice_price: number
  combo_price: number
  pack_qty: number
  subtotal: number
  delivery_type: DeliveryType
  delivery_address?: string
  delivery_distance_km?: number
  delivery_fee: number
  time_slot: TimeSlot
  delivery_date: string
  grand_total: number
  dp_amount: number
  dp_paid_at?: string
  dp_payment_proof?: string
  remaining_amount: number
  remaining_paid_at?: string
  status: OrderStatus
  cancel_deadline: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  item_type: 'protein' | 'addon'
  item_id: string
  item_name: string
  price: number
  created_at: string
}

export interface Payment {
  id: string
  order_id: string
  payment_type: PaymentType
  amount: number
  method: string
  proof_url?: string
  confirmed_at?: string
  confirmed_by?: string
  created_at: string
}

export interface InventoryLog {
  id: string
  ingredient_id: string
  change_qty: number
  reason: InventoryReason
  order_id?: string
  notes?: string
  created_by?: string
  created_at: string
}

// Combo builder types
export interface ComboSelection {
  rice: MenuItem | null
  proteins: MenuItem[]
  addons: MenuItem[]
}

export interface ComboPricing {
  rice_price: number
  protein_total: number
  addon_total: number
  combo_price: number
}

// Delivery fee calculation
export interface DeliveryFeeResult {
  base_fee: number
  extra_fee: number
  total_fee: number
  distance_km: number
}

// Time slot options
export const TIME_SLOTS: Record<TimeSlot, { label: string; label_id: string; time: string }> = {
  pagi: { label: 'Morning', label_id: 'Pagi', time: '08:00-11:00' },
  siang: { label: 'Afternoon', label_id: 'Siang', time: '11:00-14:00' },
  sore: { label: 'Evening', label_id: 'Sore', time: '14:00-17:00' },
}

// Order status labels
export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; label_id: string }> = {
  awaiting_dp: { label: 'Awaiting DP', label_id: 'Menunggu DP' },
  dp_confirmed: { label: 'DP Confirmed', label_id: 'DP Dikonfirmasi' },
  preparing: { label: 'Preparing', label_id: 'Sedang Disiapkan' },
  ready: { label: 'Ready', label_id: 'Siap' },
  out_for_delivery: { label: 'Out for Delivery', label_id: 'Dalam Pengiriman' },
  picked_up: { label: 'Picked Up', label_id: 'Sudah Diambil' },
  delivered: { label: 'Delivered', label_id: 'Terkirim' },
  done: { label: 'Done', label_id: 'Selesai' },
  cancelled: { label: 'Cancelled', label_id: 'Dibatalkan' },
}
