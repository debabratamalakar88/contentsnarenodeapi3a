
// This page is now effectively replaced by the new /dashboard/requests/new flow
// which guides the user through template creation.
// Redirecting to the main templates page as a fallback.
import { redirect } from 'next/navigation';

export default function DeprecatedNewTemplatePage() {
  redirect('/dashboard/templates');
}
