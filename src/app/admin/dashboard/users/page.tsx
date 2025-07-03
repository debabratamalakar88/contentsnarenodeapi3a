import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function ManageUsersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">View, edit, and manage all registered user accounts.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>This is a placeholder for the user management table.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-96">
            <Users className="h-24 w-24 text-muted-foreground" />
            <p className="text-muted-foreground">User management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
