
'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getAdminProfile, updateAdminProfile, changeAdminPassword } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email(), // Email is read-only, but needs to be in schema
  username: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  country_code: z.string().optional().nullable(),
  country_name: z.string().optional().nullable(),
  country_flag: z.string().optional().nullable(),
  country_phone_code: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  date_format: z.string().optional().nullable(),
  time_format: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
  current_password: z.string().min(1, "Current password is required."),
  new_password: z.string().min(8, "New password must be at least 8 characters."),
  new_password_confirmation: z.string(),
}).refine(data => data.new_password === data.new_password_confirmation, {
  message: "New passwords do not match.",
  path: ["new_password_confirmation"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function AdminSettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      phone: "",
      bio: "",
      company: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country_code: "",
      country_name: "",
      country_flag: "",
      country_phone_code: "",
      locale: "",
      currency: "",
      timezone: "",
      date_format: "",
      time_format: "",
      language: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("adminAuthToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No admin auth token found. Please log in again.",
          variant: "destructive",
        });
        setIsLoading(false);
        router.push('/admin/login');
        return;
      }

      try {
        const profileData = await getAdminProfile(token);
        form.reset(profileData);
      } catch (error) {
        toast({
          title: "Failed to load profile",
          description: "Could not fetch your profile data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [form, toast, router]);
  
  async function onSubmit(data: ProfileFormValues) {
    const token = localStorage.getItem("adminAuthToken");
    if (!token) {
        toast({
            title: "Authentication Error",
            description: "No auth token found. Please log in again.",
            variant: "destructive",
        });
        return;
    }

    try {
        await updateAdminProfile(token, data);
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved successfully.",
        });
    } catch (error: any) {
        const description = error.errors
            ? Object.values(error.errors).flat().join("\n")
            : error.message || "Could not update your profile.";
        toast({
            title: "Update Failed",
            description: description,
            variant: "destructive",
        });
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    const token = localStorage.getItem("adminAuthToken");
    if (!token) {
        toast({
            title: "Authentication Error",
            description: "No auth token found. Please log in again.",
            variant: "destructive",
        });
        return;
    }

    try {
        await changeAdminPassword(token, {
          current_password: data.current_password,
          new_password: data.new_password,
          new_password_confirmation: data.new_password_confirmation
        });
        toast({
            title: "Password Updated",
            description: "Your password has been changed. You will be logged out.",
        });
        
        localStorage.removeItem('adminAuthToken');
        router.push('/admin/login');

    } catch (error: any) {
         const description = error.errors
            ? Object.values(error.errors).flat().join("\n")
            : error.message || "Could not update your password.";
        toast({
            title: "Update Failed",
            description: description,
            variant: "destructive",
        });
    }
  }


  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage your administrator account and preferences.
        </p>
      </div>

    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        This is your administrator profile.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                        <div className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-10 w-full" />
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                     ) : (
                        <div className="space-y-8">
                             {/* Personal Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" {...field} value={field.value ?? ''} readOnly disabled className="bg-muted/50"/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="(123) 456-7890" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Acme Inc." {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bio</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Tell us a little bit about yourself" className="min-h-24" {...field} value={field.value ?? ''}/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                </div>
                            </div>
                             {/* Address Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Address</h3>
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Street Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                     <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>State / Province</FormLabel><FormControl><Input placeholder="CA" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="zip" render={({ field }) => (<FormItem><FormLabel>Zip / Postal Code</FormLabel><FormControl><Input placeholder="90210" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                        </div>
                     )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </Form>

    <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <Card>
                <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                    Update your password here. For security, you will be logged out after changing your password.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={passwordForm.control}
                        name="current_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={passwordForm.control}
                        name="new_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={passwordForm.control}
                        name="new_password_confirmation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                        {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </Form>
    </div>
  )
}
