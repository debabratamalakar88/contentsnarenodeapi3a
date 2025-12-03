

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from "next/link"
import {
  User,
  ChevronDown,
  Loader2,
  LogOut,
  Building,
  Settings
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
import { NavLinks } from "./NavLinks"
import { logoutUser, switchCompany, getCompany, type Company } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

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
    
    function hydrateCompanyData() {
        if (companyData) {
            const parsedCompany = JSON.parse(companyData);
            setCompany(parsedCompany);
        }
        setIsChecking(false);
    }
    
    hydrateCompanyData();

  }, [router, pathname, toast]);
  

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
        localStorage.removeItem('userRole');
        router.push('/login');
    }
  };

  const handleSwitchCompany = async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !company) {
        toast({ title: "Authentication error", variant: "destructive" });
        return;
    }
    
    try {
      await switchCompany(token, company.id);
      localStorage.removeItem('selectedCompany');
      router.push('/companies');
    } catch (error: any) {
       toast({ title: 'Error switching company', description: error.message, variant: 'destructive' });
    }
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
        <div className="flex items-center gap-3 text-base font-semibold min-w-[200px]">
          {company ? (
            <>
                <Avatar className="h-8 w-8 text-sm">
                  <AvatarFallback className="bg-pink-500 text-white font-bold border-pink-600">
                      {getInitials(company.company_name)}
                  </AvatarFallback>
              </Avatar>
              <span className="font-bold">{company.company_name}</span>
            </>
          ) : (
              <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center font-bold">
                      N
                  </div>
                  <span className="font-bold text-xl">NARLAX</span>
              </div>
          )}
        </div>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <nav className="ml-auto flex items-center gap-5 text-sm lg:gap-6">
            <NavLinks />
          </nav>
          <div className="mr-2">
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
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
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
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
