import { supabase } from '@/lib/supabase'

export async function getRevenueStats(days: number = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('orders')
    .select('grand_total, created_at, status')
    .gte('created_at', startDate.toISOString())
    .not('status', 'eq', 'cancelled')

  if (error) throw error

  // Group by date
  const revenueByDate: Record<string, { revenue: number; orders: number }> = {}
  let totalRevenue = 0

  for (const order of data || []) {
    const date = order.created_at.split('T')[0]
    if (!revenueByDate[date]) {
      revenueByDate[date] = { revenue: 0, orders: 0 }
    }
    revenueByDate[date].revenue += order.grand_total
    revenueByDate[date].orders += 1
    totalRevenue += order.grand_total
  }

  return {
    totalRevenue,
    totalOrders: data?.length || 0,
    avgOrderValue: data?.length ? totalRevenue / data.length : 0,
    dailyData: Object.entries(revenueByDate).map(([date, stats]) => ({
      date,
      ...stats,
    })),
  }
}

export async function getOutstandingPayments() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, grand_total, dp_amount, remaining_amount, delivery_date, users(name, phone)')
    .in('status', ['dp_confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'])
    .is('remaining_paid_at', null)
    .order('delivery_date')

  if (error) throw error

  return (data || []).map((order) => ({
    id: order.id,
    order_number: order.order_number,
    customer_name: (order.users as any)?.name || 'Unknown',
    customer_phone: (order.users as any)?.phone || '',
    remaining: order.remaining_amount,
    due_date: order.delivery_date,
  }))
}

export async function getRecentPayments(limit: number = 10) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, grand_total, dp_amount, dp_paid_at, remaining_paid_at, status, users(name)')
    .not('dp_paid_at', 'is', null)
    .order('dp_paid_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data || []).map((order) => ({
    id: order.id,
    order_number: order.order_number,
    customer: (order.users as any)?.name || 'Unknown',
    amount: order.dp_amount,
    type: 'dp' as const,
    method: 'QRIS',
    status: 'confirmed',
    date: order.dp_paid_at,
  }))
}

export async function getTopCombos(limit: number = 5) {
  const { data, error } = await supabase
    .from('orders')
    .select('rice_name, combo_price, pack_qty')
    .not('status', 'eq', 'cancelled')
    .order('pack_qty', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getInventoryValue() {
  const { data, error } = await supabase
    .from('ingredients')
    .select('stock_qty, cost_per_unit')

  if (error) throw error

  return (data || []).reduce(
    (sum, item) => sum + (item.stock_qty * (item.cost_per_unit || 0)),
    0
  )
}

export async function getPaymentSummary() {
  const [dpCollected, remainingPending] = await Promise.all([
    supabase
      .from('orders')
      .select('dp_amount')
      .not('dp_paid_at', 'is', null)
      .not('status', 'eq', 'cancelled'),
    supabase
      .from('orders')
      .select('remaining_amount')
      .is('remaining_paid_at', null)
      .not('status', 'in', ('cancelled,done')),
  ])

  const totalDp = (dpCollected.data || []).reduce(
    (sum, o) => sum + o.dp_amount,
    0
  )

  const totalRemaining = (remainingPending.data || []).reduce(
    (sum, o) => sum + o.remaining_amount,
    0
  )

  return {
    dpCollected: totalDp,
    remainingPending: totalRemaining,
    totalOutstanding: totalRemaining,
  }
}
