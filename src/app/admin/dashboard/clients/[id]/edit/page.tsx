
'use client';

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronLeft, Info, Loader2, X } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { getAdminClient, updateAdminClient } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

const clientFormSchema = z.object({
  full_name: z.string().min(1, "Full name is required."),
  email: z.string().email("Invalid email address."),
  companies: z.array(z.string()).optional(),
  phone_number: z.string().nullable().optional(),
  app_language: z.string().optional(),
  date_format: z.string().optional(),
  time_zone: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function EditAdminClientPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [companyInput, setCompanyInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const id = Number(params.id);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            full_name: "",
            email: "",
            companies: [],
            phone_number: "",
            app_language: "english",
            date_format: "mm/dd/yyyy",
            time_zone: "ist",
        }
    });

    useEffect(() => {
        if (!id) return;

        async function fetchClient() {
            const token = localStorage.getItem('adminAuthToken');
            if (!token) {
                toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
                router.push('/admin/login');
                return;
            }

            try {
                const clientData = await getAdminClient(token, id);
                
                form.reset({
                  ...clientData,
                  companies: clientData.companies || []
                });

            } catch (err: any) {
                toast({
                    variant: 'destructive',
                    title: 'Error fetching data',
                    description: err.message || 'An unexpected error occurred.',
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchClient();
    }, [id, router, toast, form]);

    const { isSubmitting } = form.formState;

    async function onSubmit(data: ClientFormValues) {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) {
            toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
            return;
        }

        try {
            await updateAdminClient(token, id, data);
            toast({ title: "Success", description: "Client updated successfully." });
            router.push('/admin/dashboard/clients');
            router.refresh(); 
        } catch (error: any) {
             const description = error.errors
                ? Object.values(error.errors).flat().join("\n")
                : error.message || "Could not update client.";
            toast({
                title: "Client Update Failed",
                description: description,
                variant: "destructive",
            });
        }
    }

    const companies = form.watch("companies", []);
    const fullName = form.watch("full_name");

    const handleCompanyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && companyInput.trim()) {
            e.preventDefault();
            const newCompany = companyInput.trim();
            if (!companies.includes(newCompany)) {
                form.setValue("companies", [...companies, newCompany]);
            }
            setCompanyInput("");
        }
    };

    const removeCompany = (companyToRemove: string) => {
        form.setValue("companies", companies.filter(company => company !== companyToRemove));
    };

    const getInitials = (name: string): string => {
        if (!name) return '';
        const words = name.trim().split(' ').filter(Boolean);
        if (words.length === 0) return '';
        if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
        return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
    }
    
    const initials = getInitials(fullName);

    if (isLoading) {
        return (
             <div className="flex flex-col h-full bg-white">
                <header className="sticky top-0 bg-white z-10"><div className="h-16 flex items-center justify-between px-6 border-b"><Skeleton className="h-8 w-48" /><div className="flex items-center gap-2"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-24" /></div></div></header>
                 <main className="flex-1 overflow-y-auto p-8"><div className="max-w-xl mx-auto space-y-8"><Skeleton className="h-24 w-24 rounded-full mx-auto" /><div className="space-y-6"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div></div></main>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full bg-white">
                <header className="sticky top-0 bg-white z-10">
                    <div className="h-16 flex items-center justify-between px-6 border-b">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild><Link href="/admin/dashboard/clients"><ChevronLeft className="h-5 w-5" /></Link></Button>
                            <h1 className="text-lg font-semibold">Edit Client Details</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" type="button" asChild><Link href={`/admin/dashboard/clients/${id}`}>CANCEL</Link></Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}SAVE CHANGES</Button>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-xl mx-auto space-y-8">
                        <div className="flex flex-col items-center gap-2">
                            <Avatar className="h-24 w-24"><AvatarFallback className="bg-green-100 text-green-800 text-4xl font-bold border">{initials || 'CL'}</AvatarFallback></Avatar>
                            <Button variant="link" type="button" className="text-primary font-semibold">Change Image</Button>
                        </div>
                        <div className="space-y-6">
                            <FormField control={form.control} name="full_name" render={({ field }) => (<FormItem><Label htmlFor="fullName" className="font-semibold text-gray-700">Full Name</Label><FormControl><Input id="fullName" placeholder="Client full name..." className="bg-gray-50 mt-1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><Label htmlFor="emailAddress" className="font-semibold text-gray-700">Email Address</Label><FormControl><Input id="emailAddress" type="email" placeholder="Contact email address..." className="bg-gray-50 mt-1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div>
                                <Label htmlFor="companyName" className="font-semibold text-gray-700">Company Name (optional)</Label>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {companies?.map((company, index) => (
                                        <Badge key={index} variant="secondary" className="pl-3 pr-2 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-md">{company}<button type="button" onClick={() => removeCompany(company)} className="ml-1.5 rounded-full hover:bg-gray-300/50 p-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"><X className="h-3 w-3" /></button></Badge>
                                    ))}
                                </div>
                                <Input id="companyName" value={companyInput} onChange={(e) => setCompanyInput(e.target.value)} onKeyDown={handleCompanyKeyDown} placeholder="Type a company name and press Enter..." className="bg-gray-50 mt-2"/>
                            </div>
                            <FormField control={form.control} name="phone_number" render={({ field }) => (<FormItem><Label htmlFor="phoneNumber" className="font-semibold text-gray-700">Phone Number (optional)</Label><div className="flex items-center mt-1"><Select defaultValue="in"><SelectTrigger className="w-[80px] rounded-r-none bg-gray-50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="in">🇮🇳</SelectItem><SelectItem value="us">🇺🇸</SelectItem><SelectItem value="gb">🇬🇧</SelectItem></SelectContent></Select><FormControl><Input id="phoneNumber" type="tel" placeholder="(415) 555-1212" className="rounded-l-none bg-gray-50" {...field} value={field.value ?? ''} /></FormControl></div><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="app_language" render={({ field }) => (<FormItem><Label htmlFor="appLanguage" className="flex items-center gap-1.5 font-semibold text-gray-700">Application Language <Info className="w-4 h-4 text-gray-400" /></Label><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger id="appLanguage" className="bg-gray-50 mt-1"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="english">English</SelectItem><SelectItem value="spanish">Spanish</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="date_format" render={({ field }) => (<FormItem><Label htmlFor="dateFormat" className="flex items-center gap-1.5 font-semibold text-gray-700">Date Format <Info className="w-4 h-4 text-gray-400" /></Label><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger id="dateFormat" className="bg-gray-50 mt-1"><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                                            <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                                                            <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                                                            <SelectItem value="yyyy/mm/dd">YYYY/MM/DD</SelectItem>
                                                            <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                                                            <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                                                            <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                                                            <SelectItem value="dd.mm.yyyy">DD.MM.YYYY</SelectItem>
                                                            <SelectItem value="yyyy.mm.dd">YYYY.MM.DD</SelectItem>
                                                        </SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="time_zone" render={({ field }) => (<FormItem><Label htmlFor="timeZone" className="flex items-center gap-1.5 font-semibold text-gray-700">Time Zone <Info className="w-4 h-4 text-gray-400" /></Label><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger id="timeZone" className="bg-gray-50 mt-1"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="ist">(+05:30) India Standard Time</SelectItem><SelectItem value="pst">(-08:00) Pacific Standard Time</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        </div>
                    </div>
                </main>
            </form>
        </Form>
    )
}
