
'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/dashboard/users", label: "Users" },
  { href: "/admin/dashboard/clients", label: "Clients" },
  { href: "/admin/dashboard/template-categories", label: "Categories" },
];

export function AdminNavLinks() {
  const pathname = usePathname()
  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "transition-colors",
            pathname.startsWith(item.href)
              ? "text-white"
              : "text-white/70 hover:text-white"
          )}
        >
          {item.label}
        </Link>
      ))}
    </>
  )
}
