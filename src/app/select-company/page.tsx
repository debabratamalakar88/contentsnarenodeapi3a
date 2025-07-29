
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCompanies, createCompany, type Company } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Briefcase, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

export default function SelectCompanyPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [isAddCompanyOpen, setAddCompanyOpen] = useState(false);

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

    const handleSelectCompany = (company: Company) => {
        localStorage.setItem('selectedCompany', JSON.stringify(company));
        router.push('/dashboard');
    };

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCompanyName.trim()) {
            toast({ title: 'Company name is required', variant: 'destructive' });
            return;
        }
        setIsCreating(true);
        const token = localStorage.getItem('authToken');
        try {
            const newCompany = await createCompany(token!, { name: newCompanyName });
            toast({ title: 'Company created successfully' });
            handleSelectCompany(newCompany);
        } catch (error: any) {
            toast({
                title: 'Error creating company',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsCreating(false);
            setNewCompanyName('');
            setAddCompanyOpen(false);
        }
    };
    
    const handleBackToLogin = () => {
        localStorage.removeItem('authToken');
        router.push('/login');
    }
    
    const avatarColors = ['bg-orange-200 text-orange-800', 'bg-green-200 text-green-800', 'bg-purple-200 text-purple-800', 'bg-blue-200 text-blue-800', 'bg-red-200 text-red-800'];

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 relative">
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
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className={`font-bold ${avatarColors[index % avatarColors.length]}`}>
                                        {getInitials(company.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-gray-800">{company.name}</p>
                                    <p className="text-sm text-muted-foreground">{company.domain || `${company.name.toLowerCase().replace(/\s/g, '')}.contentsnare.com`}</p>
                                </div>
                            </button>
                        ))
                    )}
                     <Dialog open={isAddCompanyOpen} onOpenChange={setAddCompanyOpen}>
                        <DialogTrigger asChild>
                            <div className="w-full flex items-center gap-4 p-4 rounded-lg text-left cursor-pointer">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Briefcase className="h-5 w-5 text-gray-500" />
                                </div>
                                <Button variant="default" className="bg-indigo-500 hover:bg-indigo-600">
                                    <Plus className="h-4 w-4 mr-2"/>
                                    Add New Company
                                </Button>
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleCreateCompany}>
                                <DialogHeader>
                                    <DialogTitle>Add New Company</DialogTitle>
                                    <DialogDescription>
                                        Enter the name of your new company below.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <Label htmlFor="company-name" className="sr-only">Company Name</Label>
                                    <Input
                                        id="company-name"
                                        value={newCompanyName}
                                        onChange={(e) => setNewCompanyName(e.target.value)}
                                        placeholder="Your Company Name"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setAddCompanyOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isCreating}>
                                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Company
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
