export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('Tidak ada data untuk diexport')
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function formatOrdersForExport(orders: any[]) {
  return orders.map(order => ({
    'No. Pesanan': order.order_number,
    'Tanggal': order.created_at?.split('T')[0],
    'Tipe': order.order_type === 'dessert' ? 'Dessert' : 'Main Course',
    'Menu': order.rice_name,
    'Jumlah Pack': order.pack_qty,
    'Harga/Pack': order.combo_price,
    'Subtotal': order.subtotal,
    'Kemasan': order.packaging_type || '-',
    'Biaya Kemasan': order.packaging_fee || 0,
    'Ongkir': order.delivery_fee || 0,
    'Grand Total': order.grand_total,
    'DP': order.dp_amount,
    'Status DP': order.dp_paid_at ? 'Lunas' : 'Belum',
    'Sisa Bayar': order.remaining_amount,
    'Status': order.status,
    'Tipe Kirim': order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup',
    'Tanggal Kirim': order.delivery_date,
    'Waktu': order.time_slot,
    'Catatan': order.notes || '-',
  }))
}

export function formatInventoryForExport(items: any[]) {
  return items.map(item => ({
    'Nama Bahan': item.name,
    'Satuan': item.unit,
    'Stok': item.stock_qty,
    'Min. Stok': item.min_stock_alert || '-',
    'Harga/Unit': item.cost_per_unit || '-',
    'Status': item.min_stock_alert && item.stock_qty <= item.min_stock_alert ? 'Rendah' : 'Aman',
  }))
}
