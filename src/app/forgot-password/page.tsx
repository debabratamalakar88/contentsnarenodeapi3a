
'use client';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

// This page is deprecated. The forgot password flow is now handled within the login page.
// This component now just redirects to the login page.
export default function ForgotPasswordRedirect() {
  useEffect(() => {
    redirect('/login');
  }, []);

  return null;
}
