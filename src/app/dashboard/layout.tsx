
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from "next/link"
import {
  Bell,
  HelpCircle,
  User,
  ChevronDown,
  Loader2,
  LogOut,
  Building
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
import { logoutUser, switchCompany, type Company } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const userToken = localStorage.getItem('authToken');
    const adminToken = localStorage.getItem('adminAuthToken');
    const companyData = localStorage.getItem('selectedCompany');

    if (adminToken) {
      router.replace('/admin/dashboard');
      return;
    }
    
    if (!userToken) {
      router.replace('/login');
      return;
    }

    if (!companyData && pathname !== '/companies') {
        router.replace('/companies');
        return;
    }
    
    if (companyData) {
        setCompany(JSON.parse(companyData));
    }
    
    setIsChecking(false);

  }, [router, pathname]);
  

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken');
    
    try {
      if (token) {
        await logoutUser(token);
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
        localStorage.removeItem('authToken');
        localStorage.removeItem('selectedCompany');
        router.push('/login');
    }
  };

  const handleSwitchCompany = () => {
    localStorage.removeItem('selectedCompany'); // Remove old company context
    router.push('/companies'); // Go back to company selection
  }

  if (isChecking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Render children directly for the select-company page without the main layout
  if (pathname === '/companies') {
    return <>{children}</>;
  }
  
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
                <User className="h-5 w-5 text-white" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
               {company && <DropdownMenuLabel className="font-normal text-muted-foreground -mt-2">{company.company_name}</DropdownMenuLabel>}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSwitchCompany} className="cursor-pointer">
                <Building className="mr-2 h-4 w-4"/> Switch Company
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
