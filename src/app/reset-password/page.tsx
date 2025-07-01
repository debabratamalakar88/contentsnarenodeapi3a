
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ResetPasswordForm from './ResetPasswordForm';

export const dynamic = 'force-dynamic';

function ResetPasswordLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
