
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MailCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logoutUser, resendVerificationEmail } from "@/lib/api";
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const handleResend = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You are not logged in.",
      });
      router.push('/login');
      return;
    }
    
    try {
      const data = await resendVerificationEmail(token);
      if (data.message && data.message.toLowerCase().includes('already verified')) {
        setIsAlreadyVerified(true);
        toast({
          title: "Already Verified",
          description: data.message,
        });
      } else {
        toast({
          title: "Success",
          description: data.message || "A new verification link has been sent to your email address.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send verification link. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await logoutUser(token);
      } catch (error) {
        // Fail silently on the backend, as we're logging out locally anyway
      }
    }
    localStorage.removeItem('authToken');
    router.push('/login');
  };
  
  if (isChecking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {isAlreadyVerified ? (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <MailCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4">Email Already Verified</CardTitle>
                <CardDescription>
                    Your email address has already been verified. You can now access your dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button asChild className="w-full">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                 <Button onClick={handleLogout} variant="outline" className="w-full">
                    Logout
                </Button>
            </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Verify your email</CardTitle>
            <CardDescription>
              We've sent an email to you with a verification link. Please check your inbox and follow the instructions to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email?
            </p>
            <Button onClick={handleResend} disabled={isLoading} variant="link" className="mt-2">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Click here to resend
            </Button>
          </CardContent>
          <CardContent className="text-center border-t pt-4 mt-4">
             <Button onClick={handleLogout} variant="outline" className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
