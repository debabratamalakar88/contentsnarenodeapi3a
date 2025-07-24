
'use client'

import React from 'react';

// This layout is no longer needed as the page itself controls the header and main content.
export default function NewMyTemplateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
