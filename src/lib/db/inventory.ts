import { supabase } from '@/lib/supabase'
import { Ingredient, Supplier, InventoryLog } from '@/types'

// Ingredients
export async function getIngredients() {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*, suppliers(*)')
    .order('name')

  if (error) throw error
  return data || []
}

export async function getIngredient(id: string) {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*, suppliers(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createIngredient(ingredient: Partial<Ingredient>) {
  const { data, error } = await supabase
    .from('ingredients')
    .insert(ingredient)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateIngredient(id: string, updates: Partial<Ingredient>) {
  const { data, error } = await supabase
    .from('ingredients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteIngredient(id: string) {
  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getLowStockIngredients() {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*, suppliers(*)')
    .order('name')

  if (error) throw error

  // Filter low stock (stock_qty <= min_stock_alert)
  return (data || []).filter(
    (item) => item.min_stock_alert && item.stock_qty <= item.min_stock_alert
  )
}

export async function updateStock(
  ingredientId: string,
  changeQty: number,
  reason: string,
  orderId?: string,
  userId?: string,
  notes?: string
) {
  // Get current stock
  const { data: ingredient, error: getError } = await supabase
    .from('ingredients')
    .select('stock_qty')
    .eq('id', ingredientId)
    .single()

  if (getError) throw getError

  // Update stock
  const newStock = ingredient.stock_qty + changeQty
  const { error: updateError } = await supabase
    .from('ingredients')
    .update({ stock_qty: newStock })
    .eq('id', ingredientId)

  if (updateError) throw updateError

  // Log the change
  const { error: logError } = await supabase
    .from('inventory_log')
    .insert({
      ingredient_id: ingredientId,
      change_qty: changeQty,
      reason,
      order_id: orderId,
      notes,
      created_by: userId,
    })

  if (logError) throw logError
}

export async function getInventoryLogs(ingredientId?: string) {
  let query = supabase
    .from('inventory_log')
    .select('*, ingredients(name, unit)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (ingredientId) {
    query = query.eq('ingredient_id', ingredientId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Suppliers
export async function getSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function getSupplier(id: string) {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createSupplier(supplier: Partial<Supplier>) {
  const { data, error } = await supabase
    .from('suppliers')
    .insert(supplier)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSupplier(id: string, updates: Partial<Supplier>) {
  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSupplier(id: string) {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getSupplierIngredients(supplierId: string) {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('name')

  if (error) throw error
  return data || []
}
