import EditClientView from "./EditClientView";

export async function generateStaticParams() {
  // We don't need to pre-build any client edit pages.
  // This will be handled client-side.
  return [];
}

export default function EditClientPage() {
    return <EditClientView />;
}
