'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard/requests", label: "Requests" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/team", label: "Team" },
  { href: "/dashboard/templates", label: "Templates" },
  { href: "/dashboard/reminders", label: "Reminders" },
];

export function NavLinks() {
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
