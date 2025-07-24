
'use client';

// This is a placeholder that redirects to the edit builder page.
// The creation flow for a template immediately creates a draft and sends the user to the edit flow.
// Therefore, /new/builder is not directly used. This file ensures the route exists.

import { redirect } from 'next/navigation';

export default function BuilderRedirector() {
    // In a real app, you might look for a draft ID in local storage or a query param,
    // but for this flow, we'll just redirect to the main templates page as a fallback.
    redirect('/dashboard/templates');
    return null;
}
