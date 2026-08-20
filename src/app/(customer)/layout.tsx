'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  UtensilsCrossed,
  ShoppingBag,
  User,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/menu', label: 'Menu', labelId: 'Menu' },
    { href: '/orders', label: 'Orders', labelId: 'Pesanan' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-bold text-primary">
              DapurPOS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {item.labelId}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/orders">
              <button className="relative rounded-lg p-2 hover:bg-muted transition-colors">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute right-0 top-0 h-4 w-4 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center">
                  2
                </span>
              </button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <User className="mr-2 h-4 w-4" />
                Masuk
              </Button>
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden rounded-lg p-2 hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-on-primary'
                      : 'hover:bg-muted'
                  )}
                >
                  {item.labelId}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Masuk
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              <span className="font-heading font-bold text-primary">
                DapurPOS
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 DapurPOS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
