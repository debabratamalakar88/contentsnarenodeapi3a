
'use client';

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, Info, Loader2, X } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { createAdminClient, getAdminUsers, type User } from "@/lib/api"

const clientFormSchema = z.object({
  user_id: z.any().optional().transform(val => (val ? Number(val) : null)),
  full_name: z.string().min(1, "Full name is required."),
  email: z.string().email("Invalid email address."),
  companies: z.array(z.string()).optional(),
  phone_number: z.string().nullable().optional(),
  app_language: z.string().optional(),
  date_format: z.string().optional(),
  time_zone: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function NewAdminClientPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [companyInput, setCompanyInput] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [isCompanyAlertVisible, setCompanyAlertVisible] = useState(true);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            user_id: undefined,
            full_name: "",
            email: "",
            companies: [],
            phone_number: "",
            app_language: "english",
            date_format: "ddmmyyyy",
            time_zone: "ist",
        }
    });

    useEffect(() => {
      async function fetchUsers() {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) return;
        try {
          const fetchedUsers = await getAdminUsers(token);
          setUsers(fetchedUsers);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: "Could not fetch users."});
        }
      }
      fetchUsers();
    }, [toast]);

    const { isSubmitting } = form.formState;

    async function onSubmit(data: ClientFormValues) {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) {
            toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
            return;
        }

        try {
            await createAdminClient(token, data);
            toast({ title: "Success", description: "Client created successfully." });
            router.push('/admin/dashboard/clients');
            router.refresh(); 
        } catch (error: any) {
             const description = error.errors
                ? Object.values(error.errors).flat().join("\n")
                : error.message || "Could not create client.";
            toast({
                title: "Client Creation Failed",
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full bg-white">
                <header className="sticky top-0 bg-white z-10">
                    <div className="h-16 flex items-center justify-between px-6 border-b">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/admin/dashboard/clients">
                                    <ChevronLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <h1 className="text-lg font-semibold">New Client Details</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" type="button" asChild className="text-gray-700 font-semibold border-gray-300">
                                <Link href="/admin/dashboard/clients">CANCEL</Link>
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                SAVE
                            </Button>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-xl mx-auto space-y-8">
                        <div className="flex flex-col items-center gap-2">
                            <Avatar className="h-24 w-24">
                                <AvatarFallback className="bg-green-100 text-green-800 text-4xl font-bold border">
                                    {initials ? initials : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M20 13.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5c0 1.93 1.57 3.5 3.5 3.5H8a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-1a2 2 0 0 1 2-2h1.5c1.93 0 3.5-1.57 3.5-3.5Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>
                                    )}
                                </AvatarFallback>
                            </Avatar>
                            <Button variant="link" type="button" className="text-indigo-600 font-semibold">Change Image</Button>
                        </div>

                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="user_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label htmlFor="user" className="font-semibold text-gray-700">Assign to User</Label>
                                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                            <FormControl>
                                                <SelectTrigger id="user" className="bg-gray-50 mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="">None</SelectItem>
                                                {users.map(user => (
                                                    <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField control={form.control} name="full_name" render={({ field }) => (<FormItem><Label htmlFor="fullName" className="font-semibold text-gray-700">Full Name</Label><FormControl><Input id="fullName" placeholder="Client full name..." className="bg-gray-50 mt-1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="email" render={({ field }) => (<FormItem><Label htmlFor="emailAddress" className="font-semibold text-gray-700">Email Address</Label><FormControl><Input id="emailAddress" type="email" placeholder="Contact email address..." className="bg-gray-50 mt-1" {...field} /></FormControl><FormMessage /></FormItem>)} />

                            <div>
                                <Label htmlFor="companyName" className="font-semibold text-gray-700">Company Name (optional)</Label>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {companies?.map((company, index) => (
                                        <Badge key={index} variant="secondary" className="pl-3 pr-2 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-md">
                                            {company}
                                            <button type="button" onClick={() => removeCompany(company)} className="ml-1.5 rounded-full hover:bg-gray-300/50 p-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"><X className="h-3 w-3" /></button>
                                        </Badge>
                                    ))}
                                </div>
                                <Input id="companyName" value={companyInput} onChange={(e) => setCompanyInput(e.target.value)} onKeyDown={handleCompanyKeyDown} placeholder="Type a company name and press Enter..." className="bg-gray-50 mt-2" />
                            </div>

                            {isCompanyAlertVisible && (
                                <Alert className="bg-cyan-50 border-cyan-200 text-cyan-900 [&>svg]:text-cyan-600 relative p-4">
                                    <Info className="h-5 w-5" />
                                    <AlertDescription className="pr-8">Press ENTER after typing the name of a company to add multiple companies to this client.</AlertDescription>
                                    <Button variant="ghost" size="icon" type="button" className="absolute top-1.5 right-1.5 h-7 w-7 text-cyan-900 hover:bg-cyan-100" onClick={() => setCompanyAlertVisible(false)}><X className="h-4 w-4" /></Button>
                                </Alert>
                            )}
                            
                            <FormField control={form.control} name="phone_number" render={({ field }) => (<FormItem><Label htmlFor="phoneNumber" className="font-semibold text-gray-700">Phone Number (optional)</Label><div className="flex items-center mt-1"><Select defaultValue="in"><SelectTrigger className="w-[80px] rounded-r-none bg-gray-50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="in">🇮🇳</SelectItem><SelectItem value="us">🇺🇸</SelectItem><SelectItem value="gb">🇬🇧</SelectItem></SelectContent></Select><FormControl><Input id="phoneNumber" type="tel" placeholder="(415) 555-1212" className="rounded-l-none bg-gray-50" {...field} value={field.value ?? ''} /></FormControl></div><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="app_language" render={({ field }) => (<FormItem><Label htmlFor="appLanguage" className="flex items-center gap-1.5 font-semibold text-gray-700">Application Language <Info className="w-4 h-4 text-gray-400" /></Label><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger id="appLanguage" className="bg-gray-50 mt-1"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="english">English</SelectItem><SelectItem value="spanish">Spanish</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="date_format" render={({ field }) => (<FormItem><Label htmlFor="dateFormat" className="flex items-center gap-1.5 font-semibold text-gray-700">Date Format <Info className="w-4 h-4 text-gray-400" /></Label><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger id="dateFormat" className="bg-gray-50 mt-1"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="ddmmyyyy">DD/MM/YYYY</SelectItem><SelectItem value="mmddyyyy">MM/DD/YYYY</SelectItem><SelectItem value="yyyymmdd">YYYY-MM-DD</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="time_zone" render={({ field }) => (<FormItem><Label htmlFor="timeZone" className="flex items-center gap-1.5 font-semibold text-gray-700">Time Zone <Info className="w-4 h-4 text-gray-400" /></Label><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger id="timeZone" className="bg-gray-50 mt-1"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="ist">(+05:30) India Standard Time</SelectItem><SelectItem value="pst">(-08:00) Pacific Standard Time</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        </div>
                    </div>
                </main>
            </form>
        </Form>
    )
}
