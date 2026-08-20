'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Package,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Box,
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  {
    title: 'Dashboard',
    titleId: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Orders',
    titleId: 'Pesanan',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    title: 'Menu',
    titleId: 'Menu',
    href: '/admin/menu',
    icon: UtensilsCrossed,
  },
  {
    title: 'Packaging',
    titleId: 'Kemasan',
    href: '/admin/packaging',
    icon: Box,
  },
  {
    title: 'Inventory',
    titleId: 'Inventaris',
    href: '/admin/inventory',
    icon: Package,
  },
  {
    title: 'Suppliers',
    titleId: 'Supplier',
    href: '/admin/suppliers',
    icon: Users,
  },
  {
    title: 'Finance',
    titleId: 'Keuangan',
    href: '/admin/finance',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    titleId: 'Pengaturan',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="font-heading text-lg font-bold text-primary">
              DapurPOS
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.titleId}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-border p-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-on-primary">A</span>
            </div>
            <div>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
