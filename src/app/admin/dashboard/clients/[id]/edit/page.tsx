
'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { getAdminClient, updateAdminClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const clientFormSchema = z.object({
  full_name: z.string().min(1, "Full name is required."),
  email: z.string().email("Invalid email address."),
  companies: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()) : []),
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
    const id = Number(params.id);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
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
        if (!id) return;
        async function fetchClient() {
            const token = localStorage.getItem('adminAuthToken');
            if (!token) {
                toast({ title: "Authentication Error", variant: "destructive" });
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
                toast({ variant: 'destructive', title: 'Error fetching client', description: err.message });
            }
        }
        fetchClient();
    }, [id, router, toast, form]);

    async function onSubmit(data: ClientFormValues) {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) {
            toast({ title: "Authentication Error", variant: "destructive" });
            return;
        }

        try {
            await updateAdminClient(token, id, data);
            toast({ title: "Client Updated", description: "The client's details have been successfully updated." });
            router.push("/admin/dashboard/clients");
            router.refresh();
        } catch (error: any) {
            const description = error.errors ? Object.values(error.errors).flat().join("\n") : error.message || "Could not update the client.";
            toast({ title: "Update Failed", description, variant: "destructive" });
        }
    }

    if (!form.formState.isDirty && form.formState.isLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-64 mb-4" />
                <Card><CardHeader><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-full max-w-lg" /></CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Edit Client</h1>
                <p className="text-muted-foreground">Modify the details for {form.getValues('full_name')}.</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader><CardTitle>Client Details</CardTitle><CardDescription>Update the client's information below.</CardDescription></CardHeader>
                        <CardContent className="space-y-6">
                            <FormField control={form.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="phone_number" render={({ field }) => (<FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="companies" render={({ field }) => (<FormItem><FormLabel>Companies (comma-separated)</FormLabel><FormControl><Input {...field} value={Array.isArray(field.value) ? field.value.join(', ') : ''} /></FormControl><FormMessage /></FormItem>)} />
                            
                            <h3 className="text-lg font-medium pt-4 border-t">Preferences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="app_language" render={({ field }) => (<FormItem><FormLabel>Language</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="english">English</SelectItem><SelectItem value="spanish">Spanish</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="date_format" render={({ field }) => (<FormItem><FormLabel>Date Format</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="ddmmyyyy">DD/MM/YYYY</SelectItem><SelectItem value="mmddyyyy">MM/DD/YYYY</SelectItem><SelectItem value="yyyymmdd">YYYY-MM-DD</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="time_zone" render={({ field }) => (<FormItem><FormLabel>Time Zone</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="ist">(+05:30) IST</SelectItem><SelectItem value="pst">(-08:00) PST</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="mt-6 flex justify-end gap-4">
                        <Button variant="outline" asChild><Link href="/admin/dashboard/clients">Cancel</Link></Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
