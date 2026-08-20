'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { formatIDR, formatDate } from '@/lib/utils'

interface ReceiptProps {
  order: any
  items: any[]
  customer?: any
}

export function PrintReceipt({ order, items, customer }: ReceiptProps) {
  function handlePrint() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const isDessert = order.order_type === 'dessert'

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk ${order.order_number}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 20px; }
          .receipt { max-width: 300px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .header h1 { font-size: 16px; margin: 0; }
          .header p { margin: 2px 0; font-size: 10px; }
          .info { margin-bottom: 10px; }
          .info-row { display: flex; justify-content: space-between; margin: 3px 0; }
          .items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 10px 0; }
          .item { display: flex; justify-content: space-between; margin: 3px 0; }
          .item-name { flex: 1; }
          .item-price { text-align: right; }
          .total { font-weight: bold; font-size: 14px; }
          .footer { text-align: center; margin-top: 20px; font-size: 10px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>DAPURPOS</h1>
            <p>Catering & Nasi Kotak</p>
            <p>WhatsApp: 0812-0000-0000</p>
          </div>

          <div class="info">
            <div class="info-row">
              <span>No:</span>
              <span>${order.order_number}</span>
            </div>
            <div class="info-row">
              <span>Tanggal:</span>
              <span>${formatDate(order.created_at)}</span>
            </div>
            ${customer ? `
            <div class="info-row">
              <span>Customer:</span>
              <span>${customer.name}</span>
            </div>
            <div class="info-row">
              <span>HP:</span>
              <span>${customer.phone}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span>Kirim:</span>
              <span>${order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'}</span>
            </div>
            <div class="info-row">
              <span>Tanggal Kirim:</span>
              <span>${formatDate(order.delivery_date)}</span>
            </div>
            <div class="info-row">
              <span>Waktu:</span>
              <span>${order.time_slot === 'pagi' ? 'Pagi' : order.time_slot === 'siang' ? 'Siang' : 'Sore'}</span>
            </div>
          </div>

          <div class="items">
            ${isDessert ? `
            <div class="item">
              <span class="item-name">${order.rice_name} x${order.pack_qty}</span>
              <span class="item-price">${formatIDR(order.rice_price * order.pack_qty)}</span>
            </div>
            ` : `
            <div class="item">
              <span class="item-name">Nasi: ${order.rice_name} x${order.pack_qty}</span>
              <span class="item-price">${formatIDR(order.rice_price * order.pack_qty)}</span>
            </div>
            ${items.filter(i => i.item_type === 'protein').map(item => `
            <div class="item">
              <span class="item-name">  ${item.item_name} x${order.pack_qty}</span>
              <span class="item-price">${formatIDR(item.price * order.pack_qty)}</span>
            </div>
            `).join('')}
            ${items.filter(i => i.item_type === 'addon').map(item => `
            <div class="item">
              <span class="item-name">  ${item.item_name} x${order.pack_qty}</span>
              <span class="item-price">${formatIDR(item.price * order.pack_qty)}</span>
            </div>
            `).join('')}
            `}
            ${order.packaging_type ? `
            <div class="item">
              <span class="item-name">Kemasan: ${order.packaging_type}</span>
              <span class="item-price">${formatIDR(order.packaging_fee)}</span>
            </div>
            ` : ''}
            ${order.delivery_fee > 0 ? `
            <div class="item">
              <span class="item-name">Ongkir</span>
              <span class="item-price">${formatIDR(order.delivery_fee)}</span>
            </div>
            ` : ''}
          </div>

          <div class="info-row total">
            <span>TOTAL:</span>
            <span>${formatIDR(order.grand_total)}</span>
          </div>

          <div class="info" style="margin-top: 10px;">
            <div class="info-row">
              <span>DP (50%):</span>
              <span>${formatIDR(order.dp_amount)}</span>
            </div>
            <div class="info-row">
              <span>Sisa:</span>
              <span>${formatIDR(order.remaining_amount)}</span>
            </div>
            <div class="info-row">
              <span>Status DP:</span>
              <span>${order.dp_paid_at ? 'LUNAS' : 'BELUM'}</span>
            </div>
          </div>

          <div class="footer">
            <p>Terima kasih atas pesanan Anda!</p>
            <p>Simpan struk ini sebagai bukti</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <Button variant="outline" onClick={handlePrint}>
      <Printer className="mr-2 h-4 w-4" />
      Cetak Struk
    </Button>
  )
}
