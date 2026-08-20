import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/types'

// Rice
export async function getRiceOptions(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_rice')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data || []
}

export async function getAllRice(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_rice')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function createRice(item: Partial<MenuItem>) {
  const { data, error } = await supabase
    .from('menu_rice')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateRice(id: string, updates: Partial<MenuItem>) {
  const { data, error } = await supabase
    .from('menu_rice')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteRice(id: string) {
  const { error } = await supabase
    .from('menu_rice')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Protein
export async function getProteinOptions(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_protein')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data || []
}

export async function getAllProtein(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_protein')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function createProtein(item: Partial<MenuItem>) {
  const { data, error } = await supabase
    .from('menu_protein')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProtein(id: string, updates: Partial<MenuItem>) {
  const { data, error } = await supabase
    .from('menu_protein')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProtein(id: string) {
  const { error } = await supabase
    .from('menu_protein')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Addons
export async function getAddonOptions(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_addons')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data || []
}

export async function getAllAddons(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_addons')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function createAddon(item: Partial<MenuItem>) {
  const { data, error } = await supabase
    .from('menu_addons')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAddon(id: string, updates: Partial<MenuItem>) {
  const { data, error } = await supabase
    .from('menu_addons')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAddon(id: string) {
  const { error } = await supabase
    .from('menu_addons')
    .delete()
    .eq('id', id)

  if (error) throw error
}
