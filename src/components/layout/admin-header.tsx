'use client'

import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function AdminHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari pesanan, menu..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 hover:bg-muted transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </button>

        {/* Language toggle */}
        <button className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
          ID
        </button>
      </div>
    </header>
  )
}
