import { supabase } from '@/lib/supabase'
import { Order, OrderItem, OrderStatus } from '@/types'
import { generateOrderNumber, getCancelDeadline } from '@/lib/utils'

export async function getOrders(filters?: { status?: OrderStatus; userId?: string }) {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getOrder(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getOrderByNumber(orderNumber: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', orderNumber)
    .single()

  if (error) throw error
  return data
}

interface CreateOrderParams {
  userId: string
  riceId: string
  riceName: string
  ricePrice: number
  proteins: { id: string; name: string; price: number }[]
  addons: { id: string; name: string; price: number }[]
  packQty: number
  deliveryType: 'delivery' | 'pickup'
  deliveryAddress?: string
  deliveryDistanceKm?: number
  deliveryFee: number
  timeSlot: 'pagi' | 'siang' | 'sore'
  deliveryDate: string
  notes?: string
}

export async function createOrder(params: CreateOrderParams) {
  const {
    userId,
    riceId,
    riceName,
    ricePrice,
    proteins,
    addons,
    packQty,
    deliveryType,
    deliveryAddress,
    deliveryDistanceKm,
    deliveryFee,
    timeSlot,
    deliveryDate,
    notes,
  } = params

  // Calculate prices
  const proteinTotal = proteins.reduce((sum, p) => sum + p.price, 0)
  const addonTotal = addons.reduce((sum, a) => sum + a.price, 0)
  const comboPrice = ricePrice + proteinTotal + addonTotal
  const subtotal = comboPrice * packQty
  const grandTotal = subtotal + deliveryFee
  const dpAmount = grandTotal * 0.5

  // Generate order number
  const orderNumber = generateOrderNumber()

  // Calculate cancel deadline
  const cancelDeadline = getCancelDeadline(deliveryDate, packQty)

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      order_number: orderNumber,
      rice_id: riceId,
      rice_name: riceName,
      rice_price: ricePrice,
      combo_price: comboPrice,
      pack_qty: packQty,
      subtotal,
      delivery_type: deliveryType,
      delivery_address: deliveryAddress,
      delivery_distance_km: deliveryDistanceKm,
      delivery_fee: deliveryFee,
      time_slot: timeSlot,
      delivery_date: deliveryDate,
      grand_total: grandTotal,
      dp_amount: dpAmount,
      remaining_amount: grandTotal - dpAmount,
      status: 'awaiting_dp',
      cancel_deadline: cancelDeadline.toISOString().split('T')[0],
      notes,
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Create order items
  const orderItems = [
    ...proteins.map((p) => ({
      order_id: order.id,
      item_type: 'protein' as const,
      item_id: p.id,
      item_name: p.name,
      price: p.price,
    })),
    ...addons.map((a) => ({
      order_id: order.id,
      item_type: 'addon' as const,
      item_id: a.id,
      item_name: a.name,
      price: a.price,
    })),
  ]

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  return order
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const updates: any = { status }

  // Set timestamps based on status
  if (status === 'dp_confirmed') {
    updates.dp_paid_at = new Date().toISOString()
  } else if (status === 'done') {
    updates.remaining_paid_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function confirmDpPayment(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'dp_confirmed',
      dp_paid_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function confirmRemainingPayment(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      remaining_paid_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function cancelOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getOrderStats() {
  const today = new Date().toISOString().split('T')[0]

  const [todayOrders, pendingDp, processing, completed] = await Promise.all([
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'awaiting_dp'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['preparing', 'ready', 'out_for_delivery']),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'done'),
  ])

  return {
    todayOrders: todayOrders.count || 0,
    pendingDp: pendingDp.count || 0,
    processing: processing.count || 0,
    completed: completed.count || 0,
  }
}
