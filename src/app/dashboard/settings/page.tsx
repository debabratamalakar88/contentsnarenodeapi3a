
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getProfile, updateProfile, changePassword, updateCompany, switchCompany, type Company } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
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
}).refine(data => data.password === data.password_confirmation, {
  message: "New passwords do not match.",
  path: ["new_password_confirmation"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const companyFormSchema = z.object({
    company_name: z.string().min(1, "Company name is required."),
    company_subdomain: z.string().min(1, "Subdomain is required."),
    company_logo: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      bio: "",
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
      date_format: "MM/DD/YYYY",
      time_format: "12-hour",
      language: "en",
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
  
  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
        company_name: "",
        company_subdomain: "",
        company_logo: "",
    },
  });

  const watchedCompanyName = companyForm.watch("company_name");

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    async function loadProfileAndCompany() {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No auth token found. Please log in again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const companyData = localStorage.getItem('selectedCompany');
      if (companyData) {
        const company = JSON.parse(companyData);
        setSelectedCompany(company);
        companyForm.reset({
            company_name: company.company_name || "",
            company_subdomain: company.company_subdomain || "",
            company_logo: company.company_logo || "",
        });
      }

      try {
        const responseData = await getProfile(token);
        const profileData = responseData.user || responseData.data || responseData;
        
        const defaultValues = form.getValues();
        const safeProfileData: Partial<ProfileFormValues> = {};

        // Ensure all fields have a defined, non-null value (defaults to empty string)
        for (const key in defaultValues) {
            const typedKey = key as keyof ProfileFormValues;
            safeProfileData[typedKey] = profileData[typedKey] || '';
        }
        
        form.reset(safeProfileData);
        if(profileData.email) {
            setUserEmail(profileData.email);
        }
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

    loadProfileAndCompany();
  }, [form, companyForm, toast]);

  const handleSwitchCompany = async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !selectedCompany) {
        toast({ title: "Authentication error", variant: "destructive" });
        return;
    }
    
    try {
      await switchCompany(token, selectedCompany._id);
      localStorage.removeItem('selectedCompany');
      router.push('/companies');
    } catch (error: any) {
       toast({ title: 'Error switching company', description: error.message, variant: 'destructive' });
    }
  }
  
  async function onProfileSubmit(data: ProfileFormValues) {
    const token = localStorage.getItem("authToken");
    if (!token) {
        toast({
            title: "Authentication Error",
            description: "No auth token found. Please log in again.",
            variant: "destructive",
        });
        return;
    }

    try {
        await updateProfile(token, data);
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved successfully.",
        });
    } catch (error: any) {
        toast({
            title: "Update Failed",
            description: error.message || "Could not update your profile.",
            variant: "destructive",
        });
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    const token = localStorage.getItem("authToken");
    if (!token) {
        toast({
            title: "Authentication Error",
            description: "No auth token found. Please log in again.",
            variant: "destructive",
        });
        return;
    }

    try {
        await changePassword(token, data);
        toast({
            title: "Password Updated",
            description: "Your password has been changed. Please log in again.",
        });
        
        localStorage.removeItem('authToken');
        router.push('/login');

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

  async function onCompanySubmit(data: CompanyFormValues) {
    const token = localStorage.getItem("authToken");
    if (!token || !selectedCompany) {
      toast({ title: "Error", description: "Authentication or company selection error.", variant: "destructive" });
      return;
    }
    
    try {
        const response = await updateCompany(token, selectedCompany._id, data);
        localStorage.setItem('selectedCompany', JSON.stringify(response.company));
        setSelectedCompany(response.company);
        toast({ title: "Company Updated", description: "Your company details have been saved." });
    } catch (error: any) {
         const description = error.errors ? Object.values(error.errors).flat().join("\n") : error.message || "Could not update company details.";
        toast({ title: "Update Failed", description: description, variant: "destructive" });
    }
  }


  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

    <Form {...form}>
        <form onSubmit={form.handleSubmit(onProfileSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        This is how others will see you on the site.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     {isLoading ? (
                        <div className="space-y-6"><Skeleton className="h-24 w-full" /></div>
                     ) : (
                        <>
                             <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormItem><FormLabel>Email</FormLabel><Input type="email" value={userEmail} readOnly disabled className="bg-muted/50"/></FormItem>
                                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea placeholder="Tell us a little bit about yourself" className="min-h-24" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </>
                     )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Profile
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </Form>
    
    {userRole === 'Administrator' && selectedCompany && (
      <div className="bg-card rounded-lg border p-6">
          <Form {...companyForm}>
            <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-8">
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="text-2xl font-bold">Company Details</h2>
                    <Button type="button" onClick={handleSwitchCompany}>Switch Company</Button>
                </div>

                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                        <AvatarFallback className="text-3xl bg-pink-100 text-pink-700">{getInitials(watchedCompanyName || "")}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-xl font-semibold">{watchedCompanyName}</p>
                        <Button variant="link" type="button" className="text-primary p-0 h-auto font-semibold">Change Image</Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <FormField control={companyForm.control} name="company_name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl><Input {...field} className="bg-muted/50" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={companyForm.control} name="company_subdomain" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Subdomain</FormLabel>
                            <div className="flex items-center">
                                <FormControl><Input {...field} className="bg-muted/50 rounded-r-none border-r-0" /></FormControl>
                                <span className="px-3 h-10 flex items-center bg-muted/50 text-muted-foreground border border-input rounded-r-md text-sm">.contentsnare.com</span>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div>
                    <Button type="submit" disabled={companyForm.formState.isSubmitting || isLoading}>
                        {companyForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Company
                    </Button>
                </div>
            </form>
          </Form>
      </div>
    )}

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
                    <FormField control={passwordForm.control} name="current_password" render={({ field }) => (<FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={passwordForm.control} name="new_password" render={({ field }) => (<FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={passwordForm.control} name="password_confirmation" render={({ field }) => (<FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
