
'use client';

// This is a placeholder that redirects to the edit builder page.
// The creation flow for a template immediately creates a draft and sends the user to the edit flow.
// Therefore, /new/preview is not directly used. This file ensures the route exists.

import { redirect } from 'next/navigation';

export default function PreviewRedirector() {
    redirect('/dashboard/templates');
    return null;
}
