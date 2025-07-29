
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCompanies, createCompany, selectCompany, type Company } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Briefcase, Plus, HelpCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

export default function SelectCompanyPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State for the new company form
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [companyName, setCompanyName] = useState('');
    const [companySubdomain, setCompanySubdomain] = useState('');
    const [companyLogo, setCompanyLogo] = useState<File | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return;
        }

        async function fetchCompanies() {
            try {
                const fetchedCompanies = await getCompanies(token!);
                setCompanies(fetchedCompanies);
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message || "Could not fetch your companies.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchCompanies();
    }, [router, toast]);
    
    useEffect(() => {
        setCompanySubdomain(slugify(companyName));
    }, [companyName]);

    const handleSelectCompany = async (company: Company) => {
        setIsSubmitting(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast({ title: "Authentication error", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await selectCompany(token, company.id);
            localStorage.setItem('authToken', response.token); 
            localStorage.setItem('selectedCompany', JSON.stringify(company));
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                title: 'Error selecting company',
                description: error.message,
                variant: 'destructive',
            });
            setIsSubmitting(false);
        }
    };

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName.trim()) {
            toast({ title: 'Company name is required', variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast({ title: "Authentication error", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        try {
            // NOTE: The API expects `company_logo` to be a URL string, but we are collecting a File object.
            // In a real application, you would upload the file first to get a URL.
            // For now, we will pass a placeholder or null.
            const response = await createCompany(token, { 
              company_name: companyName,
              company_subdomain: companySubdomain,
              company_logo: null // Placeholder for logo URL
            });
            toast({ title: 'Company created successfully' });
            localStorage.setItem('authToken', response.token); 
            localStorage.setItem('selectedCompany', JSON.stringify(response.company));
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                title: 'Error creating company',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleBackToLogin = () => {
        localStorage.removeItem('authToken');
        router.push('/login');
    }
    
    const avatarColors = ['bg-orange-200 text-orange-800', 'bg-green-200 text-green-800', 'bg-purple-200 text-purple-800', 'bg-blue-200 text-blue-800', 'bg-red-200 text-red-800'];

    if (viewMode === 'form') {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
             {isSubmitting && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            )}
            <div className="w-full max-w-md">
                <form onSubmit={handleCreateCompany} className="space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Configure your company</h1>
                        <div className="flex flex-col items-center gap-2">
                             <Avatar className="h-28 w-28">
                                <AvatarFallback className="bg-yellow-100 text-yellow-800 text-5xl font-bold border">
                                    {getInitials(companyName) || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <Button variant="link" type="button" className="text-pink-600 font-semibold text-sm">Add Company Logo</Button>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="companyName" className="font-semibold text-gray-700">Company Name</Label>
                            <Input
                                id="companyName"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Your Company Inc."
                                className="bg-gray-100 mt-1"
                            />
                        </div>
                        <div>
                             <Label htmlFor="companySubdomain" className="font-semibold text-gray-700 flex items-center gap-1.5">
                                Company Subdomain
                                 <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>This will be your unique URL for your company.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Label>
                             <div className="flex items-center mt-1">
                                <Input
                                    id="companySubdomain"
                                    value={companySubdomain}
                                    onChange={(e) => setCompanySubdomain(e.target.value)}
                                    placeholder="your-company"
                                    className="bg-gray-100 rounded-r-none border-r-0"
                                />
                                <span className="px-3 h-10 flex items-center bg-gray-100 text-muted-foreground border border-input rounded-r-md text-sm">.contentsnare.com</span>
                             </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-4">
                        <Button size="lg" type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-base font-bold rounded-full">
                           START USING CONTENT SNARE
                        </Button>
                        <Button variant="link" onClick={() => setViewMode('list')} className="text-muted-foreground">
                            Back to company selection
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 relative">
             {isSubmitting && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            )}
            <Button
                variant="outline"
                className="absolute top-6 right-6 rounded-full border-pink-300 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
                onClick={handleBackToLogin}
            >
                Back to Login
            </Button>
            
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Select your company</h1>
                <p className="text-center text-muted-foreground mb-8">Choose which company you want to manage.</p>

                <div className="space-y-3">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                           <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-white border">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                           </div>
                        ))
                    ) : (
                        companies.map((company, index) => (
                            <button
                                key={company.id}
                                onClick={() => handleSelectCompany(company)}
                                className="w-full flex items-center gap-4 p-4 rounded-lg bg-white border hover:border-primary hover:shadow-sm transition-all text-left"
                                disabled={isSubmitting}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className={`font-bold ${avatarColors[index % avatarColors.length]}`}>
                                        {getInitials(company.company_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-gray-800">{company.company_name}</p>
                                    <p className="text-sm text-muted-foreground">{company.company_subdomain}.contentsnare.com</p>
                                </div>
                            </button>
                        ))
                    )}
                    <div className="w-full flex justify-center pt-4">
                        <Button onClick={() => setViewMode('form')} className="bg-pink-600 hover:bg-pink-700">
                            <Plus className="h-4 w-4 mr-2"/>
                            Add New Company
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

