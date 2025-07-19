

import { redirect } from 'next/navigation';

export default function EditAdminTemplatePage({ params }: { params: { id: string } }) {
  redirect(`/admin/dashboard/templates/edit/${params.id}/essentials`);
}

