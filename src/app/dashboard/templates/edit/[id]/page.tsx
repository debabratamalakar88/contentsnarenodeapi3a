
import { redirect } from 'next/navigation';

export default function EditMyTemplatePage({ params }: { params: { id: string } }) {
  redirect(`/dashboard/templates/edit/${params.id}/essentials`);
}
