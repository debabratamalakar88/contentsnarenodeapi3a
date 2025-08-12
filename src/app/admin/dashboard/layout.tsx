
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link"
import {
  Bell,
  HelpCircle,
  User,
  LogOut,
  Loader2
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
import { AdminNavLinks } from "./AdminNavLinks"
import { adminLogout } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminAuthToken');
    const userToken = localStorage.getItem('authToken');

    if (adminToken) {
      // Admin is logged in, allow access.
      setIsChecking(false);
      return;
    }
    
    // If there is no admin token, they should not be here.
    if (userToken) {
      // If a regular user is logged in, redirect them to their dashboard.
      router.replace('/dashboard');
    } else {
      // If no one is logged in, redirect to admin login.
      router.replace('/admin/login');
    }
  }, [router]);

  const handleLogout = async () => {
    const token = localStorage.getItem('adminAuthToken');
    
    try {
      if (token) {
        await adminLogout(token);
        toast({
          title: "Success",
          description: "Logged out successfully.",
        });
      }
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Logout Error",
        description: error.message || "Could not log out from the server, but you have been logged out locally.",
      });
    } finally {
        localStorage.removeItem('adminAuthToken');
        router.push('/admin/login');
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-[#1e2029] px-4 md:px-6 text-white z-50">
        <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Logo className="h-7 w-7 text-white" />
            <span className="font-bold text-xl">NARLAX</span>
            <span className="border-l pl-2 text-lg font-light text-muted-foreground">Admin</span>
          </Link>
          <AdminNavLinks />
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full h-9 w-9 bg-pink-500 hover:bg-pink-600">
                <User className="h-5 w-5 text-white" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col bg-muted/40">
        {children}
      </main>
    </div>
  )
}
