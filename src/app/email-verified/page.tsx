
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function EmailVerifiedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 dark:bg-green-900/50 p-3 rounded-full w-fit">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="mt-4">Email Verified!</CardTitle>
          <CardDescription>
            Your email address has been successfully verified. You can now proceed to log in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Proceed to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
