import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileStack } from "lucide-react";

export default function ManageClientsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage All Clients</h1>
        <p className="text-muted-foreground">Browse and manage clients across all user accounts.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Global Client List</CardTitle>
          <CardDescription>This is a placeholder for the global client management table.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-96">
            <FileStack className="h-24 w-24 text-muted-foreground" />
            <p className="text-muted-foreground">Global client management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
