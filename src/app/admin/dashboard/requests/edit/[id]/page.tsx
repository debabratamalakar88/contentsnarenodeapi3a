
import { redirect } from 'next/navigation';

export default function EditAdminRequestPage({ params }: { params: { id: string } }) {
  redirect(`/admin/dashboard/requests/edit/${params.id}/essentials`);
}
