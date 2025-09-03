
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Users, ShieldCheck, Mail, FileText, Brush, Users2, FileStack, FolderOpen } from "lucide-react"
import Link from "next/link"

const adminActions = [
    {
        icon: Users2,
        title: "Manage Users",
        description: "View and manage all user accounts.",
        href: "/admin/dashboard/users"
    },
    {
        icon: FileStack,
        title: "Manage All Clients",
        description: "Oversee all clients across all users.",
        href: "/admin/dashboard/clients"
    },
    {
        icon: FileText,
        title: "Global Templates",
        description: "Manage system-wide templates.",
        href: "/admin/dashboard/templates"
    },
    {
        icon: FolderOpen,
        title: "Template Categories",
        description: "Organize templates into categories.",
        href: "/admin/dashboard/template-categories"
    },
    {
        icon: ShieldCheck,
        title: "Roles & Permissions",
        description: "Configure global roles and permissions.",
        href: "#"
    },
    {
        icon: Brush,
        title: "Branding",
        description: "Customize application branding.",
        href: "#"
    },
    {
        icon: Mail,
        title: "SMTP Settings",
        description: "Configure outgoing email server.",
        href: "#"
    }
]

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Super Admin Panel</h1>
        <p className="text-muted-foreground">
          Global application management and settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminActions.map((action) => (
            <Card key={action.title}>
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <action.icon className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle>{action.title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                    <Button asChild className="w-full">
                        <Link href={action.href}>Manage</Link>
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  )
}
