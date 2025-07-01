
import ClientView from "./ClientView";

export async function generateStaticParams() {
    // We don't need to pre-build any client pages.
    // This will be handled client-side.
    return [];
}

export default function ClientViewPage() {
    return <ClientView />;
}
