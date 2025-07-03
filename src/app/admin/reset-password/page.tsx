
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AdminResetPasswordForm from './AdminResetPasswordForm';

export const dynamic = 'force-dynamic';

function ResetPasswordLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <AdminResetPasswordForm />
    </Suspense>
  );
}
