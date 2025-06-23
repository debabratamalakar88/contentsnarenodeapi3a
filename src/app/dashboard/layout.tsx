import Link from "next/link"
import {
  Bell,
  HelpCircle,
  User,
  ChevronDown,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/icons"
import { NavLinks } from "./NavLinks"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-[#1e2029] px-4 md:px-6 text-white z-50">
        <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Logo className="h-7 w-7 text-white" />
            <span className="font-bold text-xl">NARLAX</span>
          </Link>
          <NavLinks />
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial" />
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-white/10">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-white/10">
            <HelpCircle className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full h-9 w-9 bg-pink-500 hover:bg-pink-600">
                <User className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/support">Support</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login">Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="gap-1 bg-primary hover:bg-primary/90">
            Quick Actions <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
