import ClientView from "./ClientView";

export async function generateStaticParams() {
    return [];
}

export default function ClientViewPage() {
    return <ClientView />;
}
