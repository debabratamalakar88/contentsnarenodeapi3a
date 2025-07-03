
'use client';

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { createAdminClient } from "@/lib/api"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const clientFormSchema = z.object({
  full_name: z.string().min(1, "Full name is required."),
  email: z.string().email("Invalid email address."),
  companies: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()) : []),
  phone_number: z.string().optional(),
  app_language: z.string().optional(),
  date_format: z.string().optional(),
  time_zone: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function NewAdminClientPage() {
    const router = useRouter();
    const { toast } = useToast();

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

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Create New Client</h1>
                <p className="text-muted-foreground">Fill out the form below to add a new client.</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Details</CardTitle>
                            <CardDescription>
                                Set the initial information for the new client.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField control={form.control} name="full_name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="Client's Full Name" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl><Input type="email" placeholder="client@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="phone_number" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number (Optional)</FormLabel>
                                    <FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="companies" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Companies (comma-separated)</FormLabel>
                                    <FormControl><Input placeholder="Company A, Company B" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <h3 className="text-lg font-medium pt-4 border-t">Preferences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="app_language" render={({ field }) => (
                                    <FormItem><FormLabel>Language</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="english">English</SelectItem><SelectItem value="spanish">Spanish</SelectItem></SelectContent></Select>
                                    <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="date_format" render={({ field }) => (
                                    <FormItem><FormLabel>Date Format</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="ddmmyyyy">DD/MM/YYYY</SelectItem><SelectItem value="mmddyyyy">MM/DD/YYYY</SelectItem><SelectItem value="yyyymmdd">YYYY-MM-DD</SelectItem></SelectContent></Select>
                                    <FormMessage /></FormItem>
                                )} />
                                 <FormField control={form.control} name="time_zone" render={({ field }) => (
                                    <FormItem><FormLabel>Time Zone</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="ist">(+05:30) IST</SelectItem><SelectItem value="pst">(-08:00) PST</SelectItem></SelectContent></Select>
                                    <FormMessage /></FormItem>
                                )} />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="mt-6 flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin/dashboard/clients">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Client
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
